'use strict';

export default class {
	/*@ngInject*/
	constructor($http) {
    	this.$http = $http;
  	}

  	$onInit(){
  		this.newSession = {
  			isRecurring: true,
  			duration: 60,
  			color: 'a'
  		};
  		this.$http.get('/api/students')
	      .then(response => {
	        this.students = response.data;
	    });
	    this.$http.get('/api/tutors')
	      .then(response => {
	        this.tutors = response.data;
	    });

	    this.colors = ['blue', 'orange', 'red', 'purple', 'grey', 'green', 'yellow'];
  	}

  	returnFilter(results, $query){
	    return results.filter(function(item){
	    	return item.fullName.toLowerCase().indexOf($query.toLowerCase()) != -1;
	    })
	}
}