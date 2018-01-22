'use strict';

export default class {
	/*@ngInject*/
	constructor(data, $filter, $http){
		this.data = data;
		this.student = data.student;
		this.tutor = data.tutor;
		this.isTutor = data.isTutor;
		this.$filter = $filter;
		this.$http = $http;
	}

	$onInit(){
		this.error = null;
		this.changed = false;
		if(this.isTutor){
			this.setNumber(this.tutor.phone);
		} else {
			this.setNumber(this.student.clientPh);
		}
		
		this.setField('parent', this.student.clientFirstName, true);
		this.setField('studentName', this.student.firstName, true);
		this.setField('tutorName', this.tutor.firstName);

		this.date = this.$filter('date')(new Date(), 'dd/MM');
		this.time = this.$filter('segmentConvert')(this.data.time);
		if(!this.isTutor){
			this.message = `Hi ${this.parent}! Just a reminder that ${this.studentName} has tuition this afternoon (${this.date}) at ${this.time}. Thanks, Pat (Personal Tutors)`;
		} else {
			this.message = `Hi ${this.tutorName}! Just a reminder that you tutor this afternoon (${this.date}) from ${this.time} to ${this.time}. Thanks, Pat (Personal Tutors)`;
		}
	}

	setNumber(data){
		if(!data){
			return
		}
		data = data.replace(' ', '');
		this.phone = data;
	}

	setField(field, data, forStudent){
		if(!data){
			if((forStudent && !this.isTutor) || (this.isTutor && !forStudent)){
				this.error = 'Not all fields are set. Please revise.';
			}
		}
		this[field] = data || 'Unset';
	}

	postSMS(phone, callback){
		var message = decodeURI(this.message);
		this.$http.post(`http://api.smsbroadcast.com.au/api-adv.php?username=pspeare&password=GSPT2011&to=${phone}&from=0414504002&message=${message}`)
		.then(res =>{
			callback(this.saveType);
		}).catch(res =>{
			this.error = "Something went wrong."
		})
	}

	submit(callback){
		this.error = null;
		var phone = this.phone.replace(' ', '');
		if(this.isTutor){
			if(this.save){
				console.log('saving');
				this.tutor.phone = phone;
				this.saveType = 'changed';
				this.$http.put('/api/tutors/' + this.tutor._id, this.tutor).then(res =>{
					this.postSMS(phone, callback)
				}).catch(res =>{
					this.error = 'Error when saving. SMS not sent. Please refresh.'
				});
			} else {
				this.saveType = 'success';
				this.postSMS(phone, callback)
			}
		} else {
			if(this.save){
				console.log('saving');
				this.student.clientPh = phone;
				this.saveType = 'changed';
				this.$http.put('/api/students/' + this.student._id, this.student).then(res =>{
					this.postSMS(phone, callback)
				}).catch(res =>{
					this.error = 'Error when saving. SMS not sent. Please refresh.'
				});
			} else {
				this.saveType = 'success';
				this.postSMS(phone, callback)
			}
		}
		
		
	}
}