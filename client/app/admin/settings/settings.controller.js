'use strict';

export default class {
	/*@ngInject*/
	constructor($http){
		this.$http = $http;
	}

	$onInit(){
		this.$http.get('/api/students')
	      .then(response => {
	        this.students = response.data;
	      });

	    this.$http.get('/api/icons')
	      .then(response => {
	        this.icons = response.data[0] || {
	        	first: '',
	        	second: '',
	        	third: '',
	        	fourth: '',
	        	fifth: '',
	        	sixth: '',
	        	year12: '',
	        };
	      });

	    this.isSandbox = location.hostname.includes('sandbox');
	}

	resetDatabase(){
		if(confirm('Are you sure you want to refresh the database?')){
      		this.$http.get('/api/users/new-database')
    	}
	}


	addYear(){
	    if(confirm('Are you sure you want to do this?')){
	      this.students.forEach(student => {
	        //If student is not in uni
	        if(!student.isTertiary){
	          if(student.grade == 12){
	            student.isTertiary = true;
	            student.isActive = false;
	          } else {
	            student.grade++;
	          }
	          //now save student
	          this.$http.put('/api/students/' + String(student._id), student);
	        }
	      })
	    }
	}

    saveIcons(){
    	this.success = false;
    	this.fail = false;
    	if(this.icons._id){
    		this.$http.put('/api/icons/' + String(this.icons._id), this.icons).then(res =>{
    			this.success = true;
    		}).catch(res =>{
    			this.fail = true;
    		});
    	} else {
    		this.$http.post('/api/icons', this.icons).then(res =>{
    			this.success = true;
    		}).catch(res =>{
    			this.fail = true;
    		});
    	}
    }
 }