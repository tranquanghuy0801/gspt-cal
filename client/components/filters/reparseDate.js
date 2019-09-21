//converts date from 'dd/MM/yyyy' to date object
export default function () {
	return function (date) {
		if (!date) {
			return new Date(2020, 10, 10);
		}
		var split = date.split('/');
		var year = +split[2]; //make integer
		var month = +split[1] - 1; //make integer and zero indexed
		var day = +split[0]; //make integer
		return new Date(year, month, day);
	}
};