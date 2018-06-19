'use strict';
function dateStringToDate(date) {
  var split = date.split('/');
  var year = +split[2]; //make integer
  if(year < 100){
    year += 2000;
  }
  var month = +split[1] - 1; //make integer and zero indexed
  var day = +split[0]; //make integer
  return new Date(year, month, day);
}

export default class {
	/*@ngInject*/
	constructor(todaysSessions, calendarDate, $http, ColorFinder, HourFinder, StartFinder){
		this.todaysSessions = todaysSessions;
		this.counts = []; // [[colour, count],[colour, count]] etc...
		this.countColours = ['blue', 'dark blue', 'green', 'dark green', 'dark orange', 'purple', 'dark purple'];
		this.total = 0;
		this.calendarDate = calendarDate;
		this.$http = $http;
		this.lastWrite = null;
		this.lastWriteId = null;
		this.loaded = false;
		this.saved = false;
		this.ColorFinder = ColorFinder;
		this.HourFinder = HourFinder;
		this.StartFinder = StartFinder;
	}

	$onInit(){

		this.$http.get('/api/colour-writes').then(res => {
			const data = res.data;

			if(!data || data.length === 0){
				return;
			}

			const found = data.find(datum => new Date(datum.calendarDate).getTime() === this.calendarDate.getTime());

			if(found){
				this.lastWrite = found.dateCreated;
				this.lastWriteId = found._id;
			};

			this.loaded = true;
		});

		this.todaysSessions.forEach(session => {

			var instance = session._instance;

			if(session.overwriteVisibility && session.overwriteVisibility[instance]){
				return
			}
			//only 3:30 PM onwards for mon - fri
			var _date = dateStringToDate(session.date);
			var day = _date.getDay();
			if(day !== 6 && day !== 1){
				//if isn't sunday or saturday

				//this time function could potentially be refactored to a service
				var time = this.StartFinder(session, instance);
				//skip sessions before 3:30 PM (930)
				if(time < 930){
					return;
				}
			}

			//set colour
			var color = this.ColorFinder(session, instance);
			var hours = this.HourFinder(session, instance)/60;

			if(this.countColours.includes(color.toLowerCase())){
				this.addColour(color, hours);
			};
		})



		this.counts.forEach(count => {
			this.total += count[1];
		})

	}

	addColour(colour, hours){
		var countIndex = this.counts.findIndex(count => count[0] === colour);

		if(countIndex === -1){
			//if not found then push it
			this.counts.push([colour, hours]);
			return;
		}

		//if it exists then increment it
		this.counts[countIndex][1] += hours;
	}

	writeDB(){
		console.log('fired');
		const data = {
			data: this.counts,
			calendarDate: this.calendarDate,
		};

		if(this.lastWriteId){
			this.$http.delete('/api/colour-writes/' + this.lastWriteId);
		}

		this.$http.post('/api/colour-writes', data).then(res => {
			this.lastWrite = new Date();
			this.saved = true;
		});
	}

}