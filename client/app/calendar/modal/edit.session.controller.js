'use strict';

export default class {
	/*@ngInject*/
	constructor($http, $filter, data) {
		this.$http = $http;
		this.data = data;
		this.instance = this.data.aInstance;
	}

	$onInit() {
		this.colors = ['blue', 'orange', 'red', 'purple', 'grey', 'green', 'yellow'];
		this.tab = 'instance';
	}

	returnName(data) {
		if (data.overwriteName && data.overwriteName[data.aInstance]) {
			return data.overwriteName[data.aInstance];
		};

		return data.student.firstName + ' ' + data.student.lastName
	}

	submit(data, callback) {
		var instance = data.aInstance;

		if (this.lastInstance) {
			data.instances = instance + 1;
		}

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