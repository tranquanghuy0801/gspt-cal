'use strict';

export default class {
	tutors;
	selectedTutor = [];

	/*@ngInject*/
	constructor($http, $filter, data) {
		this.$http = $http;
		this.data = data;
		this.instance = this.data.aInstance;
		this.initialTutor = this.data.tutorUID;
	}

	$onInit() {
		this.colors = ['blue', 'orange', 'red', 'purple', 'grey', 'green', 'yellow', 'lime'];
		this.tab = 'instance';

		this.$http.get('/api/tutors')
			.then(res => {
				this.tutors = res.data;
				const foundTutor = this.tutors.find(t => t._id === this.data.tutorUID);
				this.selectedTutor = foundTutor ? [foundTutor] : [];
			});
	}

	returnName(data) {
		if (data.overwriteName && data.overwriteName[data.aInstance]) {
			return data.overwriteName[data.aInstance];
		};

		return data.student.firstName + ' ' + data.student.lastName
	}

	returnFilter(results, $query) {
		return results.filter(function (item) {
			if (item.isActive === false) {
				return false;
			}
			return item.fullName.toLowerCase().indexOf($query.toLowerCase()) != -1;
		})
	}

	submit(data, callback) {
		if (this.selectedTutor.length === 0) {
			this.error = 'Please enter a tutor.';
			return;
		}

		var instance = data.aInstance;

		if (this.lastInstance) {
			data.instances = instance + 1;
		}

		data.tutorUID = this.selectedTutor[0]._id;

		this.$http.put('/api/lessons/' + data._id, data)
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
