'use strict';

var express = require('express');
var controller = require('./tutor.controller');
import * as auth from '../../auth/auth.service';

var router = express.Router();

router.get('/', auth.hasRole('admin'), controller.index);
router.get('/dump-all', controller.dumpAll);
router.get('/:id', auth.hasRole('admin'), controller.show);
router.get('/crmID/:id',auth.hasRole('admin'), controller.getTutorID);
router.post('/addTimeSheet',auth.hasRole('admin'), controller.addTutorTimeSheet);
router.post('/', auth.hasRole('admin'), controller.create);
router.post('/send-email/day', auth.hasRole('admin'), controller.sendEmailDay);
router.put('/:id', auth.hasRole('admin'), controller.upsert);
router.patch('/:id', auth.hasRole('admin'), controller.patch);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);

module.exports = router;
