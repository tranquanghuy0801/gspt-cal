'use strict';

export default function(){
	return function(session, instance){
		//takes a session and returns the start time in 0 - 2400 time
		if(!session){
			return;
		}

		var start;

		if(session.overwriteStart && instance in session.overwriteStart){
			start = session.overwriteStart[instance];
		} else {
			start = session.startTime;
		}

		return start;
	}
}