'use strict';

import angular from 'angular';
import routes from './admin.routes';
import StudentController from './student/student.controller';
import TutorController from './tutor/tutor.controller';
import SessionController from './session/session.controller';
import EditSessionController from './session/edit.session.controller';
import SettingsController from './settings/settings.controller';
import ColourSearchController from './colour-search/colour-search.controller'
import StudentInfoController from './student-info/student-info.controller'
import ExportTutorController from './export-tutor/export-tutor.controller'

export default angular.module('calApp.admin', ['calApp.auth', 'ui.router'])
  .config(routes)
  .controller('StudentController', StudentController)
  .controller('TutorController', TutorController)
  .controller('SessionController', SessionController)
  .controller('EditSessionController', EditSessionController)
  .controller('SettingsController', SettingsController)
  .controller('ColourSearchController', ColourSearchController)
  .controller('StudentInfoController', StudentInfoController)
  .controller('ExportTutorController', ExportTutorController)
  .name;
