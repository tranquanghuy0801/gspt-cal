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
		this.counts = {
			'blue': 0,
			'green': 0,
			'dark green': 0,
			'dark blue': 0,
			'purple': 0,
			'dark purple': 0,
			'orange': 0,
			'dark orange': 0,
			'red': 0,
		};
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

			var time = this.StartFinder(session, instance);

			const isWeekend = day === 0 || day === 6;
			
			//skip sessions before 3:30 PM (930) during the wesek
			if(!isWeekend && (time < 930)){
				return;
			}

			//set colour
			var color = this.ColorFinder(session, instance);
			var hours = this.HourFinder(session, instance)/60;

			if(typeof this.counts[color] !== 'undefined'){
				this.counts[color] += hours;
			}

		})

		this.total = Object.keys(this.counts).reduce((previous, key) => {
			if(key === 'red'){
				return previous;
			}

		    return previous + this.counts[key];
		}, 0);

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