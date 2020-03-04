/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/term-settings              ->  index
 * POST    /api/term-settings              ->  create
 * GET     /api/term-settings/:id          ->  show
 * PUT     /api/term-settings/:id          ->  upsert
 * PATCH   /api/term-settings/:id          ->  patch
 * DELETE  /api/term-settings/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import TermSettings from './termsettings.model';

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

// Gets a list of TermSettingss
export function index(req, res) {
  return TermSettings.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single TermSettings from the DB
export function show(req, res) {
  return TermSettings.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new TermSettings in the DB
export function create(req, res) {
  return TermSettings.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given TermSettings in the DB at the specified ID
export function upsert(req, res) {
  if(req.body._id) {
    Reflect.deleteProperty(req.body, '_id');
  }
  return TermSettings.findOneAndUpdate({_id: req.params.id}, req.body, {new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true}).exec()

    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing TermSettings in the DB
export function patch(req, res) {
  if(req.body._id) {
    Reflect.deleteProperty(req.body, '_id');
  }
  return TermSettings.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a TermSettings from the DB
export function destroy(req, res) {
  return TermSettings.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
