'use strict';

export default function(){
	return function(session, start, end){
		//returns an array of the valid indexes
		//e.g., [4,5,7] etc (assuming 6 is overwriteHidden)
		const msDay = 1000 * 60 * 60 * 24;
		const sessionStart = this.$filter('reparseDate')(session.date);

		if(!start || !(start instanceof Date)){
			console.warn('Invalid start date passed to service: Valid Indexes');
			return;
		}

		if(!end || !(end instanceof Date)){
			console.warn('Invalid end date passed to service: Valid Indexes');
			return;
		}

		if(sessionStart > end){
			return [];
		}

		if(end < start){
			console.warn('End date less than start date in service: Valid Indexes');
			return [];
		}

		if(session.isHidden){
			return [];
		}

		if(session.frequency === 0){
			if(end >= sessionStart && start <= sessionStart){
				var maxPossible = 1;
				var startIndex = 0;
			} else {
				return [];
			}
		} else {
			var maxPossible = Math.floor((end.getTime() - sessionStart.getTime())/msDay/session.frequency);

			if(session.instances !== 0 && (session.instances < maxPossible)){
				maxPossible = session.instances;
			}

			var startIndex = 0;
			if(start > sessionStart){
				var dif = (start.getTime() - sessionStart.getTime())/msDay;
				startIndex = Math.ceil(dif/session.frequency);

				if(startIndex < 0){
					console.warn('Negative index in service: Valid Indexes');

					startIndex = 0;
				}
			}

			if(startIndex > maxPossible){
				return [];
			}

			if(session.instances !== 0 && session.instances <= startIndex){
				return [];
			}
		}
		

		var validIndexes = [];

		for(var i = startIndex; i <= maxPossible; i++){
			if(session.instances !== 0 && session.instances === i){
				continue;
			}
			if(session.overwriteVisibility && session.overwriteVisibility[i] === true){
				continue;
			}

			validIndexes.push(i);
		};

		return validIndexes;
	}
}