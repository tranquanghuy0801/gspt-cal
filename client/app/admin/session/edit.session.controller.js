'use strict';

export default class {
	/*@ngInject*/
	constructor($http, $filter) {
    	this.$http = $http;
  	}

  	$onInit(){
	    this.colors = ['blue', 'orange', 'red', 'purple', 'grey', 'green', 'yellow'];
  	}

	submit(data, callback){
		var instance = data.aInstance;
		var changes = {};
		if(this.newDuration != data.duration){
			data.overwriteDuration = data.overwriteDuration || {};
			data.overwriteDuration[instance] = this.newDuration;
			changes.overwriteDuration = data.overwriteDuration;
		}

		if(this.newColor != data.color){
			data.overwriteColor = data.overwriteColor || {};
			data.overwriteColor[instance] = this.newColor;
			changes.overwriteColor = data.overwriteColor;
		}

		changes.globalNotes = this.globalNotes;

		if(this.specificNotes){
			data.overwriteNotes = data.overwriteNotes || {};
			data.overwriteNotes[instance] = this.specificNotes;
			changes.overwriteNotes = data.overwriteNotes;
		}

		if(this.lastInstance){
			changes.instances = instance + 1;
		}

		console.log(changes);

		this.$http.put('/api/lessons/' + data._id, changes)
		  .then(res => {
		    this.error = '';
		    callback({reason: 'success'});

		  })
		  .catch(res => {
		    console.log(res);
		    this.error = JSON.stringify(res.data, null, '\t');
		  });
	}
}