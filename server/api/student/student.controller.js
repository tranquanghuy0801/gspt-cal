/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/students              ->  index
 * POST    /api/students              ->  create
 * GET     /api/students/:id          ->  show
 * PUT     /api/students/:id          ->  upsert
 * PATCH   /api/students/:id          ->  patch
 * DELETE  /api/students/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import Student from './student.model';
import Lesson from '../lesson/lesson.model';

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

// Gets a list of Students
export function index(req, res) {
  return Student.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

function reparseDate (date) {
        var split = date.split('/');
    var year = +split[2]; //make integer
    var month = +split[1] - 1; //make integer and zero indexed
    var day = +split[0]; //make integer
    return new Date(year, month, day);
    }

function returnValidIndexes(session, start, end){
    //returns an array of the valid indexes
    //e.g., [4,5,7] etc (assuming 6 is overwriteHidden)
    const msDay = 1000 * 60 * 60 * 24;
    const sessionStart = reparseDate(session.date);

    if(!start || !(start instanceof Date)){
      console.warn('Invalid start date passed to service: Valid Indexes');
      return;
    }

    if(!end || !(end instanceof Date)){
      console.warn('Invalid end date passed to service: Valid Indexes');
      return;
    }

    if(sessionStart > end){
      return [];
    }

    if(end < start){
      console.warn('End date less than start date in service: Valid Indexes');
      return [];
    }

    if(session.isHidden){
      return [];
    }

    if(session.frequency === 0){
      if(end >= sessionStart && start <= sessionStart){
        var maxPossible = 1;
        var startIndex = 0;
      } else {
        return [];
      }
    } else {
      var maxPossible = Math.floor((end.getTime() - sessionStart.getTime())/msDay/session.frequency);

      if(session.instances !== 0 && (session.instances < maxPossible)){
        maxPossible = session.instances;
      }

      var startIndex = 0;
      if(start > sessionStart){
        var dif = (start.getTime() - sessionStart.getTime())/msDay;
        startIndex = Math.ceil(dif/session.frequency);

        if(startIndex < 0){
          console.warn('Negative index in service: Valid Indexes');

          startIndex = 0;
        }
      }

      if(startIndex > maxPossible){
        return [];
      }

      if(session.instances !== 0 && session.instances <= startIndex){
        return [];
      }
    }
    

    var validIndexes = [];

    for(var i = startIndex; i <= maxPossible; i++){
      if(session.instances !== 0 && session.instances === i){
        continue;
      }
      if(session.overwriteVisibility && session.overwriteVisibility[i] === true){
        continue;
      }

      validIndexes.push(i);
    };

    return validIndexes;
  }

export function indexActive(req, res){

  return Student.find().exec()
    .then(students => {
      return Lesson.find().exec().then(lessons => {
        const today = new Date();
        const fiveWeeksBack = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (7 * 5));
        
        var valids = lessons.map(lesson => {
          return [lesson.clientUID, returnValidIndexes(lesson, fiveWeeksBack, today)]
        });
        valids = valids.filter(valid => valid[1].length);

        console.log(valids);

        valids.forEach(valid => {
          var ind  = students.findIndex(student => valid[0] == student._id);
          console.log(ind);
          if(students[ind].found){
            students[ind].found += valid[1].length;
          } else {
            students[ind].found = valid[1].length;
          }
        })

        console.log(valids);

        var final = students.filter(student => {
          console.log(student.found);
          if(!student.found){
            return false;
          }

          if(student.found > 2){
            return true;
          }

          return false;
        });
        console.log(final);
        return res.status(200).json(final)
      })
    })
    .catch(handleError(res));
}

// Gets a list of Students
export function dumpAll(req, res) {
  return Student.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Student from the DB
export function show(req, res) {
  return Student.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Student in the DB
export function create(req, res) {
  return Student.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given Student in the DB at the specified ID
export function upsert(req, res) {
  if(req.body._id) {
    Reflect.deleteProperty(req.body, '_id');
  }
  return Student.findOneAndUpdate({_id: req.params.id}, req.body, {new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true}).exec()

    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Student in the DB
export function patch(req, res) {
  if(req.body._id) {
    Reflect.deleteProperty(req.body, '_id');
  }
  return Student.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Student from the DB
export function destroy(req, res) {
  return Student.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
