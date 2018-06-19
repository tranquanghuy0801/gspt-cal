 export default function() {
    return function (minutes, leadingZero) {
        //translates 0 - 1439 to 12:00AM - 11:59 PM
        var hours = Math.floor(minutes / 60);
		var mins = minutes % 60;
		var end = ' AM'; //assumes AM initially
		if(hours >= 12){
			hours -= 12;
			end = ' PM';
		}
		hours = hours ? String(hours) : '12';
		if(hours.length === 1 && leadingZero){
			hours = '0' + hours;
		}

		if(mins === 0){
			mins = '00';
		}

		return hours + ':' + mins + end;
    }
};