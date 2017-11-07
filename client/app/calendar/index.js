'use strict';

import angular from 'angular';
import CalendarController from './calendar.controller';

function routes($stateProvider) {
  'ngInject';

  $stateProvider.state('calendar', {
    url: '/calendar',
    template: require('./calendar.html'),
    controller: 'CalendarController',
    controllerAs: 'vm',
    authenticate: 'admin'
  });
}


export default angular.module('calApp.calendar', ['calApp.auth', 'ui.router'])
  .config(routes)
  .controller('CalendarController', CalendarController)
  .name;
