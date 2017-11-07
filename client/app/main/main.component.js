import angular from 'angular';
import uiRouter from 'angular-ui-router';

export class MainController {
  user = {
    name: '',
    email: '',
    password: ''
  };
  errors = {
    login: undefined
  };
  submitted = false;


  /*@ngInject*/
  constructor(Auth, $state, $rootScope) {
    this.Auth = Auth;
    this.$state = $state;
    this.$rootScope = $rootScope;
  }

  login(form) {
    this.submitted = true;

    if(form.$valid) {
      this.Auth.login({
        email: this.user.email,
        password: this.user.password
      })
        .then(() => {
          // Logged in, redirect to home
          this.$state.go('calendar');
        })
        .catch(err => {
          this.errors.login = err.message;
        });
    }
  }
}


function routes($stateProvider) {
  'ngInject';

  $stateProvider.state('main', {
    url: '/',
    template: require('./main.html'),
    controller: 'MainController',
    controllerAs: 'vm'
  });
}


export default angular.module('calApp.main', [uiRouter])
  .config(routes)
  .controller('MainController', MainController)
  .name;
