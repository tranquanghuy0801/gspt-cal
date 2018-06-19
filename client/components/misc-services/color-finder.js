'use strict';

export default function(){
	return function(session, instance){
		//takes a session and returns the colour
		if(!session){
			return '';
		}

		var color;

		if(session.overwriteColor && instance in session.overwriteColor){
			color = session.overwriteColor[instance];
		} else {
			color = session.color;
			var i;
			if(typeof session.overwriteFromHere === 'object'){
				for(i = 0; i <= instance; i++){
					color = session.overwriteFromHere[i] || color;
				}
			}
			
		}

		return color;
	}
}