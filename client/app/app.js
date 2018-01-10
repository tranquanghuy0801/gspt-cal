'use strict';

import angular from 'angular';
// import ngAnimate from 'angular-animate';
import ngCookies from 'angular-cookies';
import ngResource from 'angular-resource';
import ngSanitize from 'angular-sanitize';

import uiRouter from 'angular-ui-router';
import uiBootstrap from 'angular-ui-bootstrap';
import 'angular-validation-match';
import ngTagsInput from 'ng-tags-input';
import 'angular-bootstrap-contextmenu';

import {
  routeConfig
} from './app.config';

import _Auth from '../components/auth/auth.module';
import account from './account';
import admin from './admin';
import calendar from './calendar';
import navbar from '../components/navbar/navbar.component';
import main from './main/main.component';
import constants from './app.constants';
import util from '../components/util/util.module';
import Modal from '../components/modal/modal.service';
import filters from '../components/filters/';
import miscServices from '../components/misc-services/';

import './app.scss';

angular.module('calApp', [ngCookies, ngResource, ngSanitize, uiRouter, uiBootstrap, _Auth, account,
  admin, 'validation.match', navbar, main, constants, util, calendar, filters, Modal, 'ngTagsInput',
   'ui.bootstrap.contextMenu', miscServices
])
  .config(routeConfig)
  .run(function($rootScope, $location, Auth) {
    'ngInject';
    // Redirect to login if route requires auth and you're not logged in

    $rootScope.$on('$stateChangeStart', function(event, next) {
      Auth.isLoggedIn(function(loggedIn) {
        if(next.authenticate && !loggedIn ) {
          $location.path('/');
        }
      });
    });
  });

angular.element(document)
  .ready(() => {
    angular.bootstrap(document, ['calApp'], {
      strictDi: true
    });
  });
