/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/lessons              ->  index
 * POST    /api/lessons              ->  create
 * GET     /api/lessons/:id          ->  show
 * PUT     /api/lessons/:id          ->  upsert
 * PATCH   /api/lessons/:id          ->  patch
 * DELETE  /api/lessons/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import Lesson from './lesson.model';

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if(entity) {
      return res.status(statusCode).json(entity);
    }
    return null;
  };
}

function patchUpdates(patches) {
  return function(entity) {
    try {
      // eslint-disable-next-line prefer-reflect
      jsonpatch.apply(entity, patches, /*validate*/ true);
    } catch(err) {
      return Promise.reject(err);
    }

    return entity.save();
  };
}

function removeEntity(res) {
  return function(entity) {
    if(entity) {
      return entity.remove()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if(!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

// Gets a list of Lessons
export function index(req, res) {
  return Lesson.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Lesson from the DB
export function show(req, res) {
  return Lesson.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Lesson in the DB
export function create(req, res) {
  return Lesson.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given Lesson in the DB at the specified ID
export function upsert(req, res) {
  if(req.body._id) {
    Reflect.deleteProperty(req.body, '_id');
  }
  return Lesson.findOneAndUpdate({_id: req.params.id}, req.body, {new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true}).exec()

    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Lesson in the DB
export function patch(req, res) {
  console.log(req.body);
  if(req.body._id) {
    Reflect.deleteProperty(req.body, '_id');
  }
  return Lesson.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Lesson from the DB
export function destroy(req, res) {
  return Lesson.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
