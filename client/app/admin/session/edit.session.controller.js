'use strict';

export default class {
	/*@ngInject*/
	constructor($http, $filter) {
    	this.$http = $http;
    	this.$filter = $filter;
  	}

  	$onInit(){
  		this.inf = true;
  		this.newSession = {
  			instances: 0,
  			duration: 60,
  			color: 'blue',
  			frequency: 7
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

	submit(data, callback, clearCal){
		if(!this.selectedStudent || !this.selectedTutor || !data){
			this.error = 'Incomplete form or front-end bug. Refresh browser.';
			return;
		}
			
		this.newSession.startTime = data.startTime;
		this.newSession.room = data.room;
		this.newSession.location = data.location;
		this.newSession.date = this.$filter('date')(data.date, 'dd/MM/yyyy');
		this.newSession.clientUID = this.selectedStudent[0]._id;
		this.newSession.tutorUID = this.selectedTutor[0]._id;

		//if one off, set instances to 1
		if(!this.newSession.frequency)
			this.newSession.instances = 1;
		//if not a one off and infinite, set instances to 0
		if(this.newSession.frequency && this.inf)
			this.newSession.instances = 0;
		//(implied) if not inf then allow the instances to pass

		this.$http.post('/api/lessons', this.newSession)
		  .then(res => {
		    this.error = '';
		    callback({reason: 'success'});

		  })
		  .catch(res => {
		    console.log(res);
		    this.error = JSON.stringify(res.data, null, '\t');
		  });
	}
}