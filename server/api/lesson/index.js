'use strict';

var express = require('express');
var controller = require('./lesson.controller');
import * as auth from '../../auth/auth.service';

var router = express.Router();

router.get('/', auth.hasRole('admin'), controller.index);
router.get('/dump-all', controller.dumpAll);
router.get('/scrub-all', auth.hasRole('admin'), controller.scrubAll);
router.get('/:id', auth.hasRole('admin'), controller.show);

router.post('/', auth.hasRole('admin'), controller.create);
router.post('/scrub-day', auth.hasRole('admin'), controller.scrubDay);

router.put('/:id', auth.hasRole('admin'), controller.upsert);
router.patch('/:id', auth.hasRole('admin'), controller.patch);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);

module.exports = router;
