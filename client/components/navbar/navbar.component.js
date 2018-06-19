'use strict';
/* eslint no-sync: 0 */

import angular from 'angular';

export class NavbarComponent {
  menu = [{
    title: 'Home',
    state: 'main'
  }];

  isCollapsed = true;

  constructor(Auth, $http){
    'ngInject';

    this.isLoggedIn = Auth.isLoggedInSync;
    this.isAdmin = Auth.isAdminSync;
    this.getCurrentUser = Auth.getCurrentUserSync;
    this.$http = $http;
  }

  $onInit(){
    this.isSandbox = location.host.includes('sandbox');
  }

  update(){
    if(confirm('Are you sure you want to refresh the database?')){
      this.$http.get('/api/users/new-database')
    }

  }


}

export default angular.module('directives.navbar', [])
  .component('navbar', {
    template: require('./navbar.html'),
    controller: NavbarComponent
  })
  .name;
