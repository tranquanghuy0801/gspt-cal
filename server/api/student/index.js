'use strict';

var express = require('express');
var controller = require('./student.controller');
import * as auth from '../../auth/auth.service';

var router = express.Router();

router.get('/', auth.hasRole('admin'), controller.index);
router.get('/active', auth.hasRole('admin'), controller.indexActive);
router.get('/dump-all', controller.dumpAll);
router.get('/:id', auth.hasRole('admin'), controller.show);
router.post('/', auth.hasRole('admin'), controller.create);
router.post('/send-email-notif', auth.hasRole('admin'), controller.sendEmailSessionReminder);
router.put('/:id', auth.hasRole('admin'), controller.upsert);
router.patch('/:id', auth.hasRole('admin'), controller.patch);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);


module.exports = router;
