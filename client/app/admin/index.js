'use strict';

import angular from 'angular';
import routes from './admin.routes';
import StudentController from './student/student.controller';
import TutorController from './tutor/tutor.controller';
import SessionController from './session/session.controller';
import EditSessionController from './session/edit.session.controller';
import SettingsController from './settings/settings.controller';

export default angular.module('calApp.admin', ['calApp.auth', 'ui.router'])
  .config(routes)
  .controller('StudentController', StudentController)
  .controller('TutorController', TutorController)
  .controller('SessionController', SessionController)
  .controller('EditSessionController', EditSessionController)
  .controller('SettingsController', SettingsController)
  .name;
