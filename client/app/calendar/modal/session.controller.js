'use strict';

export default class {
	/*@ngInject*/
	constructor($http, $filter) {
		this.$http = $http;
		this.$filter = $filter;
		this.showNotes = false;
	}

	$onInit() {
		this.inf = true;
		this.newSession = {
			instances: 0,
			duration: 60,
			color: 'blue',
			frequency: 7
		};
		this.$http.get('/api/students')
			.then(response => {
				this.students = [];
				response.data.forEach(student => {
					if (student.isActive)
						this.students.push(student);
				});
			});
		this.$http.get('/api/tutors')
			.then(response => {
				this.tutors = response.data;
			});

		this.colors = ['blue', 'orange', 'red', 'purple', 'grey', 'green', 'yellow'];
	}

	returnFilter(results, $query) {
		return results.filter(function (item) {
			if (item.isActive === false) {
				return false;
			}
			return item.fullName.toLowerCase().indexOf($query.toLowerCase()) != -1;
		})
	}

	changeDuration(duration) {
		this.newSession.duration = duration;

		if (duration === 30) {
			console.log('showing notes...')
			this.showNotes = true;
		}
	}

	submit(data, callback) {
		if (!this.selectedStudent || !this.selectedTutor || !data) {
			this.error = 'Incomplete form or front-end bug. Refresh browser.';
			return;
		}

		this.newSession.startTime = data.startTime;
		this.newSession.room = data.room;
		this.newSession.location = data.location;
		this.newSession.date = this.$filter('date')(data.date, 'dd/MM/yyyy');
		this.newSession.clientUID = this.selectedStudent[0]._id;
		this.newSession.tutorUID = this.selectedTutor[0]._id;

		if (this.newSession._changeover === 'present') {
			this.newSession.changeover = true;
		}

		if (this.newSession._changeover === 'one off') {
			this.newSession.overwriteChangeover = { 0: true };
		}

		//if one off, set instances to 1
		if (!this.newSession.frequency)
			this.newSession.instances = 1;
		//if not a one off and infinite, set instances to 0
		if (this.newSession.frequency && this.inf)
			this.newSession.instances = 0;
		//(implied) if not inf then allow the instances to pass

		this.$http.post('/api/lessons', this.newSession)
			.then(res => {
				this.error = '';
				callback({ reason: 'success', data: res.data });
			})
			.catch(res => {
				console.log(res);
				this.error = JSON.stringify(res.data, null, '\t');
			});
	}
}