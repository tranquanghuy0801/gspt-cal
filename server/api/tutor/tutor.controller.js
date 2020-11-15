/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/tutors              ->  index
 * POST    /api/tutors              ->  create
 * GET     /api/tutors/:id          ->  show
 * PUT     /api/tutors/:id          ->  upsert
 * PATCH   /api/tutors/:id          ->  patch
 * DELETE  /api/tutors/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import Tutor from './tutor.model';
import { sendEmail } from '../../email';
import request from 'request';
import config from '../../config/environment';
var port = config.sheets_app_port; // port of Sheets application

function respondWithResult(res, statusCode) {
	statusCode = statusCode || 200;
	return function (entity) {
		if (entity) {
			return res.status(statusCode).json(entity);
		}
		return null;
	};
}

function patchUpdates(patches) {
	return function (entity) {
		try {
			// eslint-disable-next-line prefer-reflect
			jsonpatch.apply(entity, patches, /*validate*/ true);
		} catch (err) {
			return Promise.reject(err);
		}

		return entity.save();
	};
}

function removeEntity(res) {
	return function (entity) {
		if (entity) {
			return entity.remove()
				.then(() => {
					res.status(204).end();
				});
		}
	};
}

function handleEntityNotFound(res) {
	return function (entity) {
		if (!entity) {
			res.status(404).end();
			return null;
		}
		return entity;
	};
}

function handleError(res, statusCode) {
	statusCode = statusCode || 500;
	return function (err) {
		res.status(statusCode).send(err);
	};
}

// Gets a list of Tutors
export function index(req, res) {
	return Tutor.find().exec()
		.then(respondWithResult(res))
		.catch(handleError(res));
}

// Gets a list of Tutors
export function dumpAll(req, res) {
	return Tutor.find().exec()
		.then(respondWithResult(res))
		.catch(handleError(res));
}

// Gets a single Tutor from the DB
export function show(req, res) {
	return Tutor.findById(req.params.id).exec()
		.then(handleEntityNotFound(res))
		.then(respondWithResult(res))
		.catch(handleError(res));
}

// Creates a new Tutor in the DB
export function create(req, res) {
	return Tutor.create(req.body)
		.then(respondWithResult(res, 201))
		.catch(handleError(res));
}

export function sendEmailDay(req, res) {
	sendEmail('noreply@gsptcal.com.au', 'pspeare@gspt.com.au', `${req.body.range} Schedule: ${req.body.tutor}`, req.body.content);
}

// Upserts the given Tutor in the DB at the specified ID
export function upsert(req, res) {
	if (req.body._id) {
		Reflect.deleteProperty(req.body, '_id');
	}
	return Tutor.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }).exec()

		.then(respondWithResult(res))
		.catch(handleError(res));
}

// Updates an existing Tutor in the DB
export function patch(req, res) {
	if (req.body._id) {
		Reflect.deleteProperty(req.body, '_id');
	}
	return Tutor.findById(req.params.id).exec()
		.then(handleEntityNotFound(res))
		.then(patchUpdates(req.body))
		.then(respondWithResult(res))
		.catch(handleError(res));
}

// Deletes a Tutor from the DB
export function destroy(req, res) {
	return Tutor.findById(req.params.id).exec()
		.then(handleEntityNotFound(res))
		.then(removeEntity(res))
		.catch(handleError(res));
}

// Add tutor's hours to timesheet table on GSPT Sheets database
export function addTutorTimeSheet(req,res){
	console.log(req.body);
	var crmIDs = req.body.studentCRMs;
	var studentNames = req.body.studentNames;
	console.log(studentNames);
	var options = {
		url: 'http://' + config.ip + ':' + port + '/api/students/multiple-students/',
		json: true,
		body: {
			ids: Object.keys(crmIDs),
		}
	};

	request.post(options, (err, innerRes, body) => {
		if (err) {
			res.send(err);
		}
		else{
			var dataTimeSheet = [];
			for(var i = 0; i < body.length; i++){
				var name = body[i].nameFirst + body[i].nameLast;
				var name = name.replace(/\s+/g, "");
				if (body[i].crmID in crmIDs && name in studentNames){
					delete crmIDs[body[i].cr]
					var entity = {};
					entity.tutorID = req.body.tutorID;
					entity.studentID = body[i].studentID;
					entity.hours = crmIDs[body[i].crmID];
					entity.weekEnding = req.body.weekEnding;
					entity.isProcessed = false;
					entity.isReconciled = true;
					entity.rateType = "B";
					dataTimeSheet.push(entity);
					delete studentNames[name];
					delete crmIDs[body[i].crmID];
				}
			}
			console.log(dataTimeSheet);
			options = {
				url: 'http://' + config.ip + ':' + port + '/api/timesheets/multiple/',
				json: true,
				body: {
					arr: dataTimeSheet,
				}
			};
			request.post(options, (err, arrRes, body) => {
				if (err){
					res.send(err);
				}
				res.send(body);
			})
		}
	})

}

// Get tutorID based on tutor's CRM ID from GSPT Sheets database
export function getTutorID(req,res){

	var options = {
		url: 'http://' + config.ip + ':' + port + '/api/tutors/crmID/' + req.params.id,
		json: true,
	};

	request.get(options, (err, tutorRes, body) => {
		if (err) {
			res.statusCode = 404;
		}
		res.send(body[0]);
	})
}
