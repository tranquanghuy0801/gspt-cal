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
  })
  .state('admin.settings', {
    url: '/settings',
    template: require('./settings/settings.html'),
    controller: 'SettingsController',
    controllerAs: 'admin',
    authenticate: 'admin'
  })
  .state('admin.colourSearch', {
    url: '/colour-search',
    template: require('./colour-search/colour-search.html'),
    controller: 'ColourSearchController',
    controllerAs: 'admin',
    authenticate: 'admin'
  })
  .state('admin.studentInfo', {
    url: '/student-info',
    template: require('./student-info/student-info.html'),
    controller: 'StudentInfoController',
    controllerAs: 'admin',
    authenticate: 'admin'
  })
  .state('admin.exportTutor', {
    url: '/export-tutor',
    template: require('./export-tutor/export-tutor.html'),
    controller: 'ExportTutorController',
    controllerAs: 'admin',
    authenticate: 'admin'
  });
}
