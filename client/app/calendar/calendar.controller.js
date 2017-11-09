'use strict';

export default class CalendarController {
	/*@ngInject*/
	constructor(Modal, $http){
		this.Modal = Modal;
		this.$http = $http;
	}

	$onInit(){
		//defaults to paddington
		this.location = 'paddington';
		//setting locations and number of rooms with [0,1,2] arrays to loop through
		//a bit hacky but is OK
		this.rooms = {
			'paddington': this.createArray(9),
			'cannonHill': this.createArray(6)
		};
		//creates segments for the days
		this.segments = this.createArray(48);

		//int date
		this.intDay();

		this.$http.get('/api/lessons').then(response => {
        	this.sessions = response.data;
      	});
	}

	intDay(){
		this.calendarDate = new Date();
	}

	// filterSessions(){
	// 	this.filteredSessions = this.sessions.filter(session =>{
			
	// 	})
	// }

	createArray(length){
		return Array.apply(null, Array(length)).map(function (x, i) { return i; })
	}

	addDays(days){
		//calendarDate is re-int bc watcher won't update
		//with regular setTime()
		//hacky fix
		this.calendarDate = new Date(this.calendarDate.getTime() + (days * 86400000));
	}
}