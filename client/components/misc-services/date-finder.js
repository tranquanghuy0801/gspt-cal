'use strict';

export default function(){
	return function(session, instance){
		//takes a session and returns the colour
		if(!session){
			console.warn('No session provided in service: Date Finder');
			return;
		}

		if(typeof instance === 'undefined'){
			console.warn('No instance provided in service: Date Finder');
			return;
		}

		//parse date
		var split = session.date.split('/');
		var year = +split[2]; //make integer
		var month = +split[1] - 1; //make integer and zero indexed
		var day = +split[0]; //make integer
		var sessionDate = new Date(year, month, day);

		return sessionDate.setDate(sessionDate.getDate() + (session.frequency * instance));
	}
}