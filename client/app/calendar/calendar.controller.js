'use strict';

export default class CalendarController {
	/*@ngInject*/
	constructor(Modal, $http, $filter, $uibModal){
		this.Modal = Modal;
		this.$http = $http;
		this.$filter = $filter;
		this.$uibModal = $uibModal;
	}

	$onInit(){
		//defaults to paddington
		this.location = 'paddington';
		//setting locations and number of rooms with [0,1,2] arrays to loop through
		//a bit hacky but is OK
		this.rooms = {
			'paddington': this.createArray(9),
			'cannon hill': this.createArray(6)
		};
		//creates segments for the days
		this.segments = this.createArray(48);

		//int date
		this.intDay();


		//hacky code but waits to be 3 to call updateCal()/show loaded screen
		this.loaded = 0;

		this.$http.get('/api/lessons').then(response => {
        	this.sessions = response.data;
        	this.finishedLoad();
      	});

		this.$http.get('/api/students').then(response => {
        	this.students = response.data;
        	this.finishedLoad();
      	});

      	this.$http.get('/api/tutors').then(response => {
        	this.tutors = response.data;
        	this.finishedLoad();
      	});

	}

	intDay(){
		this.calendarDate = new Date();
	}

	finishedLoad(){
		this.loaded++;
		if(this.loaded == 3){
			this.intInfoAdd();
			this.updateCal();
		}
	}

	intInfoAdd(){
		this.sessions.forEach( session =>{

			this.students.forEach(student =>{
				if(session.clientUID == student._id)
					session.student = student;
			});

			this.tutors.forEach(tutor =>{
				if(session.tutorUID == tutor._id)
					session.tutor = tutor;
			});
		})
		
	}

	updateCal(){
		var parsedDate = this.$filter('date')(this.calendarDate, 'dd/MM/yyyy');
		var cleanDate = this.$filter('reparseDate')(parsedDate);
		var sessions = this.sessions;

		if(this.searchFilter)
			sessions = this.$filter('filter')(this.sessions, this.searchFilter);

		sessions.forEach( session => {

			if(session.isHidden)
				return;

			if(session.location != this.location)
				return; //wrong location

			

			if(session.date == parsedDate)
				return this.addCalendar(session, 0);

			if(session.instances == 1)
				return; //gets rid of one-off events
			//bc if they're a one-off and they don't fall
			//on same day then they need to be returned

			var objSession = this.$filter('reparseDate')(session.date);
			
			if(objSession > cleanDate)
				return; //first session is after cal date

			var daysAhead = (cleanDate - objSession)/86400000;

			if(daysAhead % session.frequency !== 0)
				return; //if mod returns > 0 then it must be a dif day

			var _instance = daysAhead/session.frequency; //returns supposed instance
			//remember that it's still zero-indexed here too

			if(session.instances === 0) //if infinite
				return this.addCalendar(session, _instance);

			if(session.instances > _instance) //if more or equal instances possible
				return this.addCalendar(session, _instance);

		});

		this.addDropAndDrag();
	}

	addDropAndDrag(){
		var drop = ev => {
		    ev.preventDefault();
		    var data = ev.dataTransfer.getData("text");
		    var el = document.getElementById(data);
			if(ev.target.appendChild(el)){
				var id = el.dataset.id;
				var instance = +el.dataset.instance;
				var time = +ev.target.dataset.time;
				var room = +ev.target.dataset.room;
				this.sessions.forEach(session =>{
					if(id == session._id){
						session.overwriteStart = session.overwriteStart || {};
						session.overwriteStart[instance] = time;
						session.overwriteRoom = session.overwriteRoom || {};
						session.overwriteRoom[instance] = room;
						this.$http.put('/api/lessons/' + id, {
							overwriteRoom: session.overwriteRoom,
							overwriteStart: session.overwriteStart
						}).then(response => {
				        	this.reloadCal();
				      	});
					}
				})
			}
		}

		var allowDrop = function(ev) {
		    ev.preventDefault();
		}

		var dragEnter = function(){
			this.classList.add('drag-cell');
		}

		var dragLeave = function(){
			this.classList.remove('drag-cell');
		}

		var dragStart = function(ev) {
		    ev.dataTransfer.setData("text", ev.target.id);
		    this.classList.add('in-drag');
		    this.closest('table').classList.add('in-drag');
		};

		var dragStop = function(){
			document.querySelectorAll('.in-drag').forEach(function(item){
		    	item.classList.remove('in-drag');
		    });
		    document.querySelectorAll('.drag-cell').forEach(function(item){
		    	item.classList.remove('drag-cell');
		    });
		}

		document.querySelectorAll('.free-col').forEach(function(item){
			item.addEventListener('drop', drop);
			item.addEventListener('dragover', allowDrop);
			item.addEventListener('dragenter', dragEnter);
			item.addEventListener('dragleave', dragLeave);
		});

		document.querySelectorAll('.session-cell').forEach(function(item){
			item.addEventListener('dragstart', dragStart);
		});

		document.addEventListener("dragend", dragStop);
		document.addEventListener('drop', dragStop);

	}

	reloadCal(){
		this.$http.get('/api/lessons').then(response => {
        	this.sessions = response.data;
        	this.intInfoAdd();
        	this.clearCal();
      	});
	}

	addSessionModal(segment, room, $event){
		var _targ = $event.target;


		var modalInstance = this.$uibModal.open({
	        template: require('./modal/add-session.html'),
	        controller: 'SessionController',
	        controllerAs: 'vm',
	        resolve:{
	          data: () => {
	            return {
	              startTime: segment,
	              room: room,
	              location: this.location,
	              date: this.calendarDate
	            }
	          }
	        } 
	      });

		modalInstance.result.then(res => {
			if(res.reason == 'success')
				this.reloadCal();
		})
		
	}

	editSessionModal(uid, instance){
		var _data;
		this.sessions.forEach( item => {
			if(uid == item._id)
				_data = item;
		})

		if(!_data)
			return;

		_data.aInstance = instance;

		var modalInstance = this.$uibModal.open({
	        template: require('./modal/edit-session.html'),
	        controller: 'EditSessionController',
	        controllerAs: 'vm',
	        resolve:{
	          data: () => {
	            return _data
	          }
	        } 
	      });

		modalInstance.result.then(res => {
			if(res.reason == 'success')
				this.reloadCal();
		})
		
	}

	clearCal(){
		console.log('clearing calendar');
		document.querySelectorAll('.session-cell').forEach(item =>{
			item.parentNode.removeChild(item);
		})
		this.updateCal();
	}

	addCalendar(session, instance){
		//takes zero-based instances

		var identifier = 't' + session.startTime + 'r' + session.room;
		//identified applied to table cell,
		// 'a-' + identified to session div
		
		var color = session.color; //re-int color everytime
		var _div = document.createElement('div');
		if(session.color.indexOf(' ') != -1){
			var _temp = session.color.split(' ');
			color = _temp[1] + ' ' + _temp[0]
		}
		_div.className = 'session-cell';
		_div.id = 'a-' + identifier;
		_div.setAttribute('draggable', 'true');
		_div.setAttribute('data-id', session._id);
		_div.setAttribute('data-instance', instance);
		_div.style.height = String(100 * (session.duration/30)) + '%';
		_div.innerHTML = '<span class="student">' + session.student.firstName + ' ' + session.student.lastName + '</span>';
		_div.innerHTML += '<span>' + session.tutor.firstName + ' ' + session.tutor.lastName + '</span>';
		_div.innerHTML += '<div class="a-bg ' + 'aa' + color + '"></div>';
		var _start = (session.overwriteStart && instance in session.overwriteStart) ? session.overwriteStart[instance] : session.startTime;
		var _room = (session.overwriteRoom && instance in session.overwriteRoom) ? session.overwriteRoom[instance] : session.room;
		var _targ = document.getElementById('t' + _start + 'r' + _room);
		_targ && _targ.insertBefore(_div, null);
	}

	createArray(length){
		return Array.apply(null, Array(length)).map(function (x, i) { return i; })
	}

	addDays(days){
		//calendarDate is re-int bc watcher won't update
		//with regular setTime()
		//hacky fix
		this.calendarDate = new Date(this.calendarDate.getTime() + (days * 86400000));
		this.clearCal();
	}

	changeLocation(location){
		this.location = location;
		this.clearCal();
	}
}