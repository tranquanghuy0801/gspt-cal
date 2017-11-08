 export default function() {
    return function (segment) {
        //translates 0 - 47 to 12:00AM - 11:30 PM
		//1 = 12:30AM etc...
		//ugly code... I know
        var hours = Math.floor(segment/2);
		var mins = segment % 2 ? '30' : '00';
		var end = ' AM'; //assumes AM initially
		if(hours >= 12){
			hours -= 12;
			end = ' PM';
		}
		hours = hours ? String(hours) : '12';

		return hours + ':' + mins + end;
    }
};