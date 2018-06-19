'use strict';

import angular from 'angular';

import roundUp from './roundUp';
import segmentConvert from './segmentConvert';
import startFrom from './startFrom';
import reparseDate from './reparseDate';
import toDateString from './toDateString';
import minuteConvert from './minuteConvert';

export default angular.module('calApp.filters', [])
	.filter('roundUp', roundUp)
	.filter('segmentConvert', segmentConvert)
	.filter('startFrom', startFrom)
	.filter('reparseDate', reparseDate)
	.filter('toDateString', toDateString)
	.filter('minuteConvert', minuteConvert)
	.name;