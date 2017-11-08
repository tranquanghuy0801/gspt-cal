'use strict';

export default class CalendarController {
	/*@ngInject*/
	constructor(Modal){
		this.Modal = Modal;
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
	}



	createArray(length){
		return Array.apply(null, Array(length)).map(function (x, i) { return i; })
	}

	convertSegment(segment){
		//translates 0 - 47 to 12:00AM - 11:30 PM
		//1 = 12:30AM etc...
		//ugly code... I know
		var hours = Math.floor(segment/2);
		var mins = segment % 2 ? '30' : '00';
		var end = ' AM';
		if(hours >= 12){
			hours -= 12;
			end = ' PM';
		}
		hours = hours ? String(hours) : '12';
		hours += ':';

		return hours + mins + end;

	}

	createSession(segment, room){
		//pass through days too maybe?
		//maybe location too?
		this.Modal.addSession(segment, room);
	}
}