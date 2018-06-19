'use strict';

export default function(){
	return function(session, instance){
		//takes a session and returns the colour
		if(!session){
			return '';
		}

		var hours;

		if(session.overwriteDuration && instance in session.overwriteDuration){
			hours = session.overwriteDuration[instance];
		} else {
			hours = session.duration;
		}

		return hours;
	}
}