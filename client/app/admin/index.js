'use strict';

import angular from 'angular';
import routes from './admin.routes';
import StudentController from './student/student.controller';
import TutorController from './tutor/tutor.controller';
import SessionController from './session/session.controller';

export default angular.module('calApp.admin', ['calApp.auth', 'ui.router'])
  .config(routes)
  .controller('StudentController', StudentController)
  .controller('TutorController', TutorController)
  .controller('SessionController', SessionController)
  .name;
