'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider.state('admin', {
    url: '/admin',
    template: require('./admin.html'),
    authenticate: 'admin'
  }).state('admin.student', {
    url: '/student',
    template: require('./student/student.html'),
    controller: 'StudentController',
    controllerAs: 'admin',
    authenticate: 'admin'
  }).state('admin.tutor', {
    url: '/tutor',
    template: require('./tutor/tutor.html'),
    controller: 'TutorController',
    controllerAs: 'admin',
    authenticate: 'admin'
  }).state('admin.session', {
    url: '/session',
    template: require('./session/session.html'),
    controller: 'SessionController',
    controllerAs: 'admin',
    authenticate: 'admin'
  })
  .state('admin.settings', {
    url: '/settings',
    template: require('./settings/settings.html'),
    controller: 'SettingsController',
    controllerAs: 'admin',
    authenticate: 'admin'
  });
}
