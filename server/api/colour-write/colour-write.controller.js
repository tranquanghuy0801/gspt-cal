/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/colour-writes              ->  index
 * POST    /api/colour-writes              ->  create
 * GET     /api/colour-writes/:id          ->  show
 * PUT     /api/colour-writes/:id          ->  upsert
 * PATCH   /api/colour-writes/:id          ->  patch
 * DELETE  /api/colour-writes/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import ColourWrite from './colour-write.model';

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

// Gets a list of ColourWrites
export function index(req, res) {
  return ColourWrite.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single ColourWrite from the DB
export function show(req, res) {
  return ColourWrite.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new ColourWrite in the DB
export function create(req, res) {
  return ColourWrite.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given ColourWrite in the DB at the specified ID
export function upsert(req, res) {
  if(req.body._id) {
    Reflect.deleteProperty(req.body, '_id');
  }
  return ColourWrite.findOneAndUpdate({_id: req.params.id}, req.body, {new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true}).exec()

    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing ColourWrite in the DB
export function patch(req, res) {
  if(req.body._id) {
    Reflect.deleteProperty(req.body, '_id');
  }
  return ColourWrite.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a ColourWrite from the DB
export function destroy(req, res) {
  return ColourWrite.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
