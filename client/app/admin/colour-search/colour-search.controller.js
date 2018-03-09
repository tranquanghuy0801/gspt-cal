'use strict';

export default class {
	/*@ngInject*/
	constructor($http, $filter) {
    	this.$http = $http;
    	this.$filter = $filter;
  	}

  	
  	$onInit(){
  		this.search = {};
  		this.colours = ['Blue', 'Dark Blue', 'Striped Blue', 
  						'Orange','Dark Orange','Striped Orange',
  						'Red',			'Dark Red',			'Striped Red',
  						'Purple','Dark Purple','Striped Purple',
  						'Grey',		'Dark Grey',		'Striped Grey',
  						'Green',	'Dark Green',	'Striped Green',
  						'Yellow','Dark Yellow','Striped Yellow'
  						]
  	}
 }