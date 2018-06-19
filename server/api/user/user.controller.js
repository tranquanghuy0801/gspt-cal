'use strict';

import User from './user.model';
import config from '../../config/environment';
import jwt from 'jsonwebtoken';
import Lesson from '../lesson/lesson.model'
import Student from '../student/student.model'
import Tutor from '../tutor/tutor.model'
var request = require('request');


function validationError(res, statusCode) {
  statusCode = statusCode || 422;
  return function(err) {
    return res.status(statusCode).json(err);
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    return res.status(statusCode).send(err);
  };
}

/**
 * Get list of users
 * restriction: 'admin'
 */
export function index(req, res) {
  return User.find({}, '-salt -password').exec()
    .then(users => {
      res.status(200).json(users);
    })
    .catch(handleError(res));
}

/**
 * Creates a new user
 */
export function create(req, res) {
  var newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.role = 'user';
  newUser.save()
    .then(function(user) {
      var token = jwt.sign({ _id: user._id }, config.secrets.session, {
        expiresIn: 60 * 60 * 24 * 5 //5 days
      });
      res.json({ token });
    })
    .catch(validationError(res));
}

/**
 * Get a single user
 */
export function show(req, res, next) {
  var userId = req.params.id;

  return User.findById(userId).exec()
    .then(user => {
      if(!user) {
        return res.status(404).end();
      }
      res.json(user.profile);
    })
    .catch(err => next(err));
}


export function newDatabase(req, res){
  if(global.isSandbox !== true){
    return;
  }

    Tutor.remove({});
    Student.remove({});
    Lesson.remove({});
    User.find({}).remove()
      .then(() => {
        User.create({
          provider: 'local',
          role: 'admin',
          name: 'Admin',
          email: 'contact@personaltutors.com.au',
          password: 'admin'
        })
        .then(() => console.log('finished populating users'))
        .catch(err => console.log('error populating users', err));
      });


    request('http://www.gsptcal.com.au/api/students/dump-all', function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var data = JSON.parse(body);

        Student.create(data)
      }
    })
    
    request('http://www.gsptcal.com.au/api/tutors/dump-all', function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var data = JSON.parse(body);

        Tutor.create(data)
      }
    })

    return request('http://www.gsptcal.com.au/api/lessons/dump-all', function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var data = JSON.parse(body);

        Lesson.create(data)
      }
    })

}


/**
 * Deletes a user
 * restriction: 'admin'
 */
export function destroy(req, res) {
  return User.findByIdAndRemove(req.params.id).exec()
    .then(function() {
      res.status(204).end();
    })
    .catch(handleError(res));
}

/**
 * Change a users password
 */
export function changePassword(req, res) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  return User.findById(userId).exec()
    .then(user => {
      if(user.authenticate(oldPass)) {
        user.password = newPass;
        return user.save()
          .then(() => {
            res.status(204).end();
          })
          .catch(validationError(res));
      } else {
        return res.status(403).end();
      }
    });
}

/**
 * Get my info
 */
export function me(req, res, next) {
  var userId = req.user._id;

  return User.findOne({ _id: userId }, '-salt -password').exec()
    .then(user => { // don't ever give out the password or salt
      if(!user) {
        return res.status(401).end();
      }
      res.json(user);
    })
    .catch(err => next(err));
}

/**
 * Authentication callback
 */
export function authCallback(req, res) {
  res.redirect('/');
}
