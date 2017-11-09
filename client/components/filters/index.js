'use strict';

import angular from 'angular';

import roundUp from './roundUp';
import segmentConvert from './segmentConvert';
import startFrom from './startFrom';
import reparseDate from './reparseDate';

export default angular.module('calApp.filters', [])
	.filter('roundUp', roundUp)
	.filter('segmentConvert', segmentConvert)
	.filter('startFrom', startFrom)
	.filter('reparseDate', reparseDate)
	.name;