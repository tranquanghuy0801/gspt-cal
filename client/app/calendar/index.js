'use strict';

import angular from 'angular';
import CalendarController from './calendar.controller';
import SendSMSController from './send-sms/send-sms.controller';
import SessionController from './modal/session.controller';
import EditSessionController from './modal/edit.session.controller';
import ColourCountController from './colour-count/colour-count.controller';

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
  .controller('SendSMSController', SendSMSController)
  .controller('ColourCountController', ColourCountController)
  .controller('SessionController', SessionController)
  .controller('EditSessionController', EditSessionController)
  .name;
