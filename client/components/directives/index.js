'use strict';

import angular from 'angular';

import ngRightClick from './right-click';

export default angular.module('calApp.directives', [])
	.directive('ngRightClick', ngRightClick)
	.name;