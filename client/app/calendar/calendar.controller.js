'use strict';

export default class CalendarController {
	/*@ngInject*/
	constructor(Modal){
		this.Modal = Modal;
	}

	$onInit(){
		this.paddington =  this.createArray(9);
		this.isPaddington = true;
		this.cannonHill =  this.createArray(6);
		this.isCannonHill = false;
		this.segments = this.createArray(48);
		this.rooms = this.paddington;
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