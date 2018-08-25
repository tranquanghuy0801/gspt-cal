'use strict';

export default class CalendarController {
	/*@ngInject*/
	constructor(Modal, $http, $filter, $uibModal, $compile, $timeout, copyTextToClipboard, ColorFinder, HourFinder, StartFinder, ValidIndexes, DateFinder){
		this.Modal = Modal;
		this.$http = $http;
		this.$filter = $filter;
		this.$uibModal = $uibModal;
		this.$compile = $compile;
		this.$timeout = $timeout;
		this.copyTextToClipboard = copyTextToClipboard;
		this.ColorFinder = ColorFinder;
		this.HourFinder = HourFinder;
		this.StartFinder = StartFinder;
		this.ValidIndexes = ValidIndexes;
		this.DateFinder = DateFinder;
	}

	$onInit(){
		this.isSandbox = location.host.includes('sandbox');

		this.visibleLessons = []; //used by sandbox

		this.intDay();

		this.icons = {
	        first: '',
	        second: '',
	        third: '',
	        fourth: '',
	        fifth: '',
	        sixth: '',
	        year12: '',
	    };

	    this.clearIconFilters();

		this.$http.get('/api/icons').then(response => {
			if(response && response.data && response.data[0]){
				this.icons = response.data[0]
			}
			this.finishedLoad();
        })

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

		
		this.loading = true; //defaults to loading

		//hacky code but waits to be 4 to call updateCal()/show loaded screen
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


      	var changeColour = (colour) =>{
      		colour = colour.toLowerCase();
      		return ($itemScope, $event) => {
	            var _targ = $event.target.classList.contains('session-cell') ? $event.target : $event.target.closest('.session-cell');
				var _uid = _targ.dataset.id;
				var _instance = +_targ.dataset.instance;
				this.editColour(_uid, _instance, colour);
	        }
      	}

      	var tempColourChildren = ['Yellow', 'Green', 'Dark Green', 'Orange', 'Purple', 'Red', 'Dark Red'];
      	tempColourChildren = tempColourChildren.map(item =>{
      		return {
      			text: item,
      			click: changeColour(item)
      		}
      	});

      	var changeIcon = (icon, perm) => {
      		return ($itemScope, $event) => {
	            var _targ = $event.target.classList.contains('session-cell') ? $event.target : $event.target.closest('.session-cell');
				var _uid = _targ.dataset.id;
				var _instance = +_targ.dataset.instance;
				this.editIcon(_uid, _instance, icon, perm);
	        }
      	}

      	var menuDisplayed = ($itemScope, $event) => {
      		return !!($event.target.classList.contains('session-cell') ? $event.target : $event.target.closest('.session-cell'))
        }

        var dateSame = ($itemScope, $event) => {
        	var today = new Date();
        	var tomorrow = new Date();
        	tomorrow.setDate(today.getDate() + 1);
        	return menuDisplayed($itemScope, $event) && (this.calendarDate.toDateString() === today.toDateString() || this.calendarDate.toDateString() === tomorrow.toDateString());
        }

      	this.menuOptions = [{
	        text: 'Add Session',
	        hasBottomDivider: true,
	        click: ($itemScope, $event) => {
	           console.log($itemScope, $event);
	           var _time = (1440 / this.segments.length) * $itemScope.$parent.segment;
	           this.addSessionModal(_time, $itemScope.room)
	        }
	    }, {
	        text: 'Edit',
	        displayed: menuDisplayed,
	        click: ($itemScope, $event) => {
	            var _targ = $event.target.classList.contains('session-cell') ? $event.target : $event.target.closest('.session-cell');
				var _uid = _targ.dataset.id;
				var _instance = +_targ.dataset.instance;
				this.editSessionModal(_uid, _instance);
	        }
	    }, {
	        text: 'Copy',
	        displayed: menuDisplayed,
	        children: [
	        	{
	        		text: 'Phone Number',
	        		click: ($itemScope, $event) => {
	        			var text = $event.target.classList.contains('session-cell') ? $event.target.dataset.phone : $event.target.closest('.session-cell').dataset.phone
	        			this.copyTextToClipboard(text)
	        		},
	        	},
	        	{
	        		text: 'Email Address',
	        		click: ($itemScope, $event) => {
	        			var text = $event.target.classList.contains('session-cell') ? $event.target.dataset.email : $event.target.closest('.session-cell').dataset.email
	        			this.copyTextToClipboard(text)
	        		},
	        	},
	        ]
	    },{
	        text: 'Delete',
	        hasBottomDivider: true,
	        displayed: menuDisplayed,
	        children: [
	        	{
	        		text: 'Instance',
	        		click: ($itemScope, $event) => {
			            var _targ = $event.target.classList.contains('session-cell') ? $event.target : $event.target.closest('.session-cell');
						var _uid = _targ.dataset.id;
						var _instance = +_targ.dataset.instance;
						this.overwriteHide(_uid, _instance);
			        },
	        	},
	        	{
	        		text: 'Series',
	        		click: ($itemScope, $event) => {
			            var _targ = $event.target.classList.contains('session-cell') ? $event.target : $event.target.closest('.session-cell');
						var _uid = _targ.dataset.id;
						if(confirm('Are you sure you want to permanently delete this series?')){
							this.deleteSeries(_uid);
						}
			        },
	        	}
	        ],       
	    }, 
	    {
	    	text: 'SMS Student',
	    	displayed: dateSame,
	    	click: ($itemScope, $event) => {
	            var _targ = $event.target.classList.contains('session-cell') ? $event.target : $event.target.closest('.session-cell');
				var _uid = _targ.dataset.id;
				var _instance = +_targ.dataset.instance;
				var _time = $itemScope.$parent.segment;
				this.sendSMS(_uid, _instance, _time, false);
	        }
	    },
	    {
	    	text: 'SMS Tutor',
	    	displayed: dateSame,
	    	click: ($itemScope, $event) => {
	            var _targ = $event.target.classList.contains('session-cell') ? $event.target : $event.target.closest('.session-cell');
				var _uid = _targ.dataset.id;
				var _instance = +_targ.dataset.instance;
				var _time = $itemScope.$parent.segment;
				this.sendSMS(_uid, _instance, _time, true);
	        }
	    },
	    {
	    	text: 'Email Tutor',
	    	hasBottomDivider: true,
	    	children: [{
	    		text: 'This Day',
	    		click: ($itemScope, $event) => {
		            const targ = $event.target.classList.contains('session-cell') ? $event.target : $event.target.closest('.session-cell');
					const uid = targ.dataset.id;
					this.sendEmail(uid, this.calendarDate, false);
		        },
	    	}, {
	    		text: 'This Week',
	    		click: ($itemScope, $event) => {
		            const targ = $event.target.classList.contains('session-cell') ? $event.target : $event.target.closest('.session-cell');
					const uid = targ.dataset.id;
					this.sendEmail(uid, this.calendarDate, true);
		        },
	    	}],
	    },
	    {
	        text: 'Inactivate Student',
	        hasBottomDivider: true,
	        displayed: menuDisplayed,
	        click: ($itemScope, $event) => {
	            var _targ = $event.target.classList.contains('session-cell') ? $event.target : $event.target.closest('.session-cell');
				var _uid = _targ.dataset.id;
				var _instance = +_targ.dataset.instance;
				this.studentInactive(_uid, _instance);
	        }
	    }, {
	        text: 'Temporary Icon',
	        displayed: menuDisplayed,
	        children: [
	        	{
	        		text: '1. Paid',
	        		click: changeIcon(1, false),
	        	},
	        	{
	        		text: '2. New Client',
	        		click: changeIcon(2, false),
	        	},
	        	{
	        		text: '5. Tick',
	        		click: changeIcon(5, false),
	        	},
	        	{
	        		text: '6. Cross',
	        		click: changeIcon(6, false),
	        	},
	        ]
	    }, {
	        text: 'Permanent Icon',
	        displayed: menuDisplayed,
	        hasBottomDivider: true,
	        children: [
	        	{
	        		text: '3. Third',
	        		click: changeIcon(3, true),
	        	},
	        	{
	        		text: '4. Payment Stored',
	        		click: changeIcon(4, true),
	        	},
	        ]
	    }, {
	        text: 'Temporary Colour',
	        hasBottomDivider: true,
	        displayed: menuDisplayed,
	        children: tempColourChildren
	    },{
	    	text: 'Toggle Changeover',
	    	hasBottomDivider: true,
	        displayed: menuDisplayed,
	        click: ($itemScope, $event) => {
	            var _targ = $event.target.classList.contains('session-cell') ? $event.target : $event.target.closest('.session-cell');
				var _uid = _targ.dataset.id;
				var _instance = +_targ.dataset.instance;
				this.overwriteChangeover(_uid, _instance);
	        },
	    },
	    {
	        text: 'Close'
	    }];
	}

	intDay(){
		//int date
		const today = new Date();
		//remove hours, seconds etc
		this.calendarDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
	}

	editColour(id, instance, colour){
		var session = this.sessions.find(session => id == session._id);

		session.overwriteColor = session.overwriteColor || {};
		session.overwriteColor[instance] = colour;
		this.$http.put('/api/lessons/' + id, {
			overwriteColor: session.overwriteColor
		}).then(response => {
        	this.reloadStudents();
      	});
	}

	clearMessages(){
		this.tempSuccess = null;
	}

	studentInactive(id, instance){
		//function makes student inactive
		var session = this.sessions.find(session => id == session._id);

		this.$http.put('/api/students/' + session.student._id, {
				isActive: false
			}).then(response => {
	        	this.reloadStudents();
	      	});
	}

	clearIconFilters(){
		 this.iconFilters = {
	        first: false,
	        second: false,
	        third: false,
	        fourth: false,
	        fifth: false,
	        sixth: false,
	        year12: false,
	    };
	}

	sendEmail(id, date, isWeek){
		const msDay = 1000 * 60 * 60 * 24;
		
		if(isWeek){
			if(date.getDay() === 0){
				var startOfWeek = date.getDate() - 7;
			} else {
				var startOfWeek = date.getDate() - (date.getDay() - 1);
			}
			
			var start = new Date(date.getFullYear(), date.getMonth(), startOfWeek);
			var end = new Date(date.getFullYear(), date.getMonth(), startOfWeek + 6);
		} else {
			var start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
			var end = start;
		}

		const tutorID = this.sessions.find(session => id == session._id).tutorUID;
		const tutor = this.tutors.find(tutor => tutorID === tutor._id);
		const tutorSessions = this.sessions.filter(session => tutorID === session.tutorUID);

		var sessionData = [];

		tutorSessions.forEach(session => {
			const validIndexes = this.ValidIndexes(session, start, end);

			validIndexes.forEach(index => {

				const basicTime = this.StartFinder(session, index);

				console.log(basicTime);
				const formattedTime = this.$filter('minuteConvert')(basicTime, false);
				const sessionDate = this.DateFinder(session, index);
				const formattedDate = this.$filter('toDateString')(sessionDate);
				const color = this.ColorFinder(session, index);

				sessionData.push({
					student: session.student,
					time: formattedTime,
					isEmpty: false,
					basicTime,
					date: formattedDate,
					sessionDate,
					color,
				});

			});
		});

		if(!isWeek){
			sessionData = sessionData.filter(session => {
				var acceptedColors = ['blue', 'dark blue', 'green', 'dark green', 'purple', 'dark purple'];
				var color = session.color.toLowerCase();

				return acceptedColors.includes(color);
			})
		};

		if(sessionData.length === 0){
			return alert('Something went wrong. No sessions found.');
		}

		var datesPresent = [];
		sessionData.forEach(session => {
			if(datesPresent.includes(session.date) === false){
				datesPresent.push(session.date);
			};
		})

		var times = [930, 990, 1050, 1110, 1170, 1230, 1290];

		datesPresent.forEach(datePresent => {
			var filteredSessions = sessionData.filter(session => session.date === datePresent);

			times.forEach(time => {
				const found = filteredSessions.find(session => session.basicTime === time);

				if(!found){
					const formattedTime = this.$filter('minuteConvert')(time, false);
					const sessionDate = this.$filter('reparseDate')(datePresent);

					sessionData.push({
						basicTime: time,
						isEmpty: true,
						date: datePresent,
						time: formattedTime,
						sessionDate,
					});
				}
			})
		})

		sessionData = sessionData.sort((a,b) => {
			if(a.sessionDate < b.sessionDate){
				return -1;
			}

			if(a.sessionDate > b.sessionDate){
				return 1;
			}

			if(a.basicTime < b.basicTime){
				return -1;
			}

			if(a.basicTime > b.basicTime){
				return 1;
			}

			return 0;
		});

		var html = '<ul>';
		sessionData.forEach(session => {
			if(session.isEmpty){
				if(isWeek){
					var time = `${session.date}, ${session.time}`;
				} else {
					var time = `${session.time}`;
				}
				html += `<li>${time} - No Student</li>`;
				return;
			}

			if(isWeek){
				var time = `${session.date}, ${session.time}`;
			} else {
				var time = `${session.time}`;
			}

			if(session.student.isTertiary){
				var grade = '(Uni Student)';
			} else {
				var grade = `(Year ${session.student.grade})`;
			}

			html += `<li>${time} - ${session.student.firstName} ${session.student.lastName} ${grade}`;

			if(isWeek){
				html += ' ' + session.color;
			}

			html += '</li>';
			
		})

		html += '</ul>';

		this.$http.post('/api/tutors/send-email/day', {
			content: html,
			range: isWeek ? 'Week' : 'Day',
			tutor: tutor.firstName + ' ' + tutor.lastName,
		});

	}

	sendSMS(id, instance, time, isTutor){
		var session = this.sessions.find(session => id == session._id);
		var tutor = session.tutor;
		var student = session.student;

		var today = new Date();
       	var tomorrow = new Date();
       	tomorrow.setDate(today.getDate() + 1);
		var isTomorrow = this.calendarDate.toDateString() === tomorrow.toDateString();

		this.sendSMSModal(student, time, tutor, isTutor, isTomorrow);
	}

	colourCountModal(){
		const todaysSessions = this.todaysSessions();
		const calendarDate = this.calendarDate;

		this.$uibModal.open({
	        template: require('./colour-count/colour-count.html'),
	        controller: 'ColourCountController',
	        controllerAs: 'vm',
	        resolve:{
	          todaysSessions: () => {
	            return todaysSessions
	          },
	          calendarDate: () => {
	          	return calendarDate
	          },
	        } 
	    })
	}

	sendSMSModal(student, time, tutor, isTutor, isTomorrow){

		this.$uibModal.open({
	        template: require('./send-sms/send-sms.html'),
	        controller: 'SendSMSController',
	        controllerAs: 'vm',
	        resolve:{
	          data: () => {
	            return {
	              student: student,
	              time: time,
	              tutor: tutor,
	              isTutor: isTutor,
	              isTomorrow,
	            }
	          }
	        } 
	    }).result.then(res => {
	    	this.tempSuccess = true;
			if(res.reason == 'change'){
				this.reloadCal();
			}
		})
		
	}

	editIcon(id, instance, icon, perm){
		var session = this.sessions.find(session => id == session._id)

		if(perm){
			//needs to be either 3 or 4 here
			var key = 'var' + String(icon);
			var property = !session.student[key];
			var change = {[key]: property};

			this.$http.put('/api/students/' + session.student._id, change).then(response => {
	        	this.reloadStudents();
	      	});
			return;
		}

		//can be 1,2,5,6
		var key = 'overwriteVar' + String(icon);
		session[key] = session[key] || {};
		session[key][instance] = !session[key][instance];
		var change = {[key]: session[key]};

		this.$http.put('/api/lessons/' + id, change).then(response => {
        	this.reloadCal();
      	});

	}

	deleteSeries(id){
		this.$http.delete('/api/lessons/' + id)
			.then(res => {
				this.reloadCal();
			})
	}

	overwriteHide(id, instance){
		this.sessions.forEach(session =>{
			if(id == session._id){
				session.overwriteVisibility = session.overwriteVisibility || {};
				session.overwriteVisibility[instance] = true;
				this.$http.put('/api/lessons/' + id, {
					overwriteVisibility: session.overwriteVisibility
				}).then(response => {
		        	this.reloadCal();
		      	});
			}
		})
	}

	overwriteChangeover(id, instance){
		this.sessions.forEach(session =>{
			if(id == session._id){
				session.overwriteChangeover = session.overwriteChangeover || {};
				if(typeof session.overwriteChangeover[instance] === 'undefined'){
					session.overwriteChangeover[instance] = false;
				} else {
					session.overwriteChangeover[instance] = !session.overwriteChangeover[instance];
				}
				
				this.$http.put('/api/lessons/' + id, {
					overwriteChangeover: session.overwriteChangeover
				}).then(response => {
		        	this.reloadCal();
		      	});
			}
		})
	}

	iconFilterChange(key){
		this.iconFilters[key] = !this.iconFilters[key];
		this.clearCal();
	}

	finishedLoad(){
		this.loaded++;
		if(this.loaded === 4){
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

	todaysSessions(){
		var parsedDate = this.$filter('date')(this.calendarDate, 'dd/MM/yyyy');
		var cleanDate = this.$filter('reparseDate')(parsedDate);
		var sessions = this.sessions;


		if(this.searchFilter)
			sessions = this.$filter('filter')(this.sessions, this.searchFilter);

		//filter via icons
		sessions = sessions.filter(session => {
			var objSession = this.$filter('reparseDate')(session.date);
			var daysAhead = (cleanDate - objSession)/86400000;
			var instance = daysAhead/session.frequency;

			if(this.iconFilters.first && (!session.overwriteVar1 || session.overwriteVar1[instance] !== true)){
				return;
			}

			if(this.iconFilters.second && (!session.overwriteVar2 || session.overwriteVar2[instance] !== true)){
				return;
			}

			if(this.iconFilters.third && session.student.var3 !== true){
				return;
			}

			if(this.iconFilters.fourth && session.student.var4 !== true){
				return;
			}

			if(this.iconFilters.fifth && (!session.overwriteVar5 || session.overwriteVar5[instance] !== true)){
				return;
			}

			if(this.iconFilters.sixth && (!session.overwriteVar6 || session.overwriteVar6[instance] !== true)){
				return;
			}

			if(this.iconFilters.year12 && session.student.grade !== 12){
				return;
			}

			return true;
		})


		var filteredSessions = sessions.filter( session => {
			if(session.isHidden)
				return;

			if(session.location != this.location)
				return; //wrong location

			if(session.date == parsedDate)
				return true;

			console.log(session);

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
				return true;

			if(session.instances > _instance) //if more or equal instances possible
				return true;

		});

		return filteredSessions.map(session => {
			if(session.date == parsedDate){
				session._instance = 0;
				return session;
			};

			var objSession = this.$filter('reparseDate')(session.date);
			var daysAhead = (cleanDate - objSession)/86400000;
			var _instance = daysAhead/session.frequency;

			session._instance = _instance;

			return session;
		});
	}

	updateCal(){
		this.visibleLessons = [];
		var parsedDate = this.$filter('date')(this.calendarDate, 'dd/MM/yyyy');
		var cleanDate = this.$filter('reparseDate')(parsedDate);
		var todaysSessions = this.todaysSessions();

		todaysSessions.forEach( session => {
			if(!session){
				console.log(todaysSessions)
				return;
			}

			if(session.date == parsedDate)
				return this.addCalendar(session, 0);

			var objSession = this.$filter('reparseDate')(session.date);

			var daysAhead = (cleanDate - objSession)/86400000;

			var _instance = daysAhead/session.frequency; //returns supposed instance
			//remember that it's still zero-indexed here too

			this.addCalendar(session, _instance);

		});

		this.addDropAndDrag();
	}

	handleClick($event){
		var _targ = $event.target.classList.contains('free-col') ? $event.target : $event.target.closest('.free-col');
		var _startTime = _targ.dataset.time;
		var _room = _targ.dataset.room;

		if(_targ.childElementCount === 0){
			return this.addSessionModal(_startTime, _room);
		}

		//then there must be one or more items in the cell
		var closest = $event.target.classList.contains('session-cell') ? $event.target : $event.target.closest('.session-cell');
		var finalTarg = closest || _targ.firstChild;
		var _uid = finalTarg.dataset.id;
		var _instance = +finalTarg.dataset.instance;

		this.editSessionModal(_uid, _instance);
	}

	addDropAndDrag(){
		var drop = ev => {
		    ev.preventDefault();
		    var id = ev.dataTransfer.getData("text");
		    var el = document.querySelector('[data-id="' + id + '"]');
			if(ev.target.appendChild(el)){
				var instance = +el.dataset.instance;
				var time = +ev.target.dataset.time;
				var room = +ev.target.dataset.room;

				var session = this.sessions.find(session => id == session._id);
				if(!session){
					return; //this likely will never be called though
				}
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
			//this is where the error is, id that is set here is incorrect
		    ev.dataTransfer.setData("text", ev.target.dataset.id);
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
			item.ondrop = drop;
			item.ondragover = allowDrop;
			item.ondragenter = dragEnter;
			item.ondragleave = dragLeave;
		});

		document.querySelectorAll('.session-cell').forEach(function(item){
			item.ondragstart = dragStart;
		});

		document.ondragend = dragStop;
		document.ondrop = dragStop;

		//Set scroll height properly
		var el = document.querySelector('.table-wrap');
		if(this.loading || this.changingDay){
			el.scrollTop = 432;
		}
		
		this.changingDay = false;
		this.loading = false;

	}

	reloadCal(){
		this.$http.get('/api/lessons').then(response => {
        	this.sessions = response.data;
        	this.intInfoAdd();
        	this.clearCal();
      	});
	}

	reloadStudents(){
		this.$http.get('/api/students').then(response => {
        	this.students = response.data;
        	this.reloadCal();
      	});
	}

	addSessionModal(startTime, room){

		this.$uibModal.open({
	        template: require('./modal/add-session.html'),
	        controller: 'SessionController',
	        controllerAs: 'vm',
	        resolve:{
	          data: () => {
	            return {
	              startTime: startTime,
	              room: room,
	              location: this.location,
	              date: this.calendarDate,
	            }
	          }
	        } 
	    }).result.then(res => {
			if(res.reason == 'success'){
				this.tempSuccess = true;
				this.reloadCal();
			}
		})
		
	}

	editSessionModal(uid, instance){
		var _data = this.sessions.find(item => item._id == uid);

		if(!_data)
			return;

		_data.aInstance = instance;

		this.$uibModal.open({
	        template: require('./modal/edit-session.html'),
	        controller: 'EditSessionController',
	        controllerAs: 'vm',
	        resolve:{
	          data: () => {
	            return _data
	          }
	        } 
	    }).result.then(res => {
			if(res.reason == 'success'){
				this.tempSuccess = true;
				this.reloadCal();
			}
		})
		
	}

	clearCal(delayUpdate){
		console.log('clearing calendar');
		document.querySelectorAll('.session-cell').forEach(item =>{
			item.parentNode.removeChild(item);
		})
		if(delayUpdate){
			this.$timeout(() =>{
				this.updateCal();
			}, 300);
		} else {
			this.updateCal();
		}
		
	}

	scrubAll(){
		//used by sandbox
		this.$http.get('/api/lessons/scrub-all').then(response => {
        	this.reloadStudents();
      	});
	}

	scrubDay(){
		//used by sandbox
		this.$http.post('/api/lessons/scrub-day', {list: this.visibleLessons}).then(response => {
        	this.reloadStudents();
      	});
	}

	addCalendar(session, instance){
		//takes zero-based instances

		if(session.overwriteVisibility && session.overwriteVisibility[instance]){
			return;
		}

		this.visibleLessons.push(session._id); //used by sandbox


		var identifier = 't' + session.startTime + 'r' + session.room;
		//identified applied to table cell,
		// 'a-' + identified to session div
		
		var specificNotes = (session.overwriteNotes && instance in session.overwriteNotes) ? session.overwriteNotes[instance] : null;
		//set colour

		var color = this.ColorFinder(session, instance);
		
		var _div = document.createElement('div');
		if(color.indexOf(' ') != -1){
			var _temp = color.split(' ');
			color = _temp[1] + ' ' + _temp[0]
		}
		_div.className = 'session-cell';
		_div.id = 'a-' + identifier;
		_div.setAttribute('draggable', 'true');
		_div.setAttribute('data-id', session._id);
		_div.setAttribute('data-phone', session.student.clientPh);
		_div.setAttribute('data-email', session.student.clientEmail);
		_div.setAttribute('data-instance', instance);

		var _duration = this.HourFinder(session, instance);
		_div.style.height = `calc(${String(100 * (_duration/30))}% - 4px)`;
		if(_duration < 60)
			_div.className += ' single-cell';

		var isChangeover = (session.overwriteChangeover && instance in session.overwriteChangeover) ? session.overwriteChangeover[instance] : session.changeover;
		if(isChangeover){
			_div.className += ' changeover';
		}

		if(session.isChangeover && session.isChangeover[instance])
			_div.className += ' changeover';

		if(session.overwriteName && session.overwriteName[instance]){
			_div.innerHTML = `<span class="student">${session.overwriteName[instance]}</span>`;
		} else {
			_div.innerHTML = `<span class="student">${session.student.firstName} ${session.student.lastName}</span>`;
		}
		
		_div.innerHTML += `<span class="tutor">${session.tutor.firstName} ${session.tutor.lastName}</span>`;

		var compiledNotes = '';
		if(session.globalNotes){
			_div.innerHTML += `<br><span class="notes global-notes">${session.globalNotes}</span>`;
			compiledNotes += `Global Notes: \n${session.globalNotes}\n`;
		}
		if(specificNotes){
			_div.innerHTML += `<br><span class="notes specific-notes">${specificNotes}</span>`;
			compiledNotes += `Specific Notes: \n${specificNotes}\n`;
		}

		//Add contact name
		if(session.student.clientFirstName || session.student.clientLastName){
			compiledNotes += `Contact Name: ${session.student.clientFirstName} ${session.student.clientLastName}\n`;
		}
		//Add contact number
		if(session.student.clientPh)
			compiledNotes += `Contact Number: ${session.student.clientPh}\n`;

		//Add grade
		compiledNotes += `Student Year: ${session.student.grade}`;

		//Add title notes
		_div.setAttribute('title', compiledNotes);


		var _icons = '';
		if(session.overwriteVar1 && session.overwriteVar1[instance] === true)
			_icons += `<i class="fa fa-${this.icons.first} norm-icon" aria-hidden="true"></i>`;
		if(session.overwriteVar2 && session.overwriteVar2[instance] === true)
			_icons += `<i class="fa fa-${this.icons.second} norm-icon" aria-hidden="true"></i>`;
		if(session.student.var3)
			_icons += `<i class="fa fa-${this.icons.third} norm-icon" aria-hidden="true"></i>`;
		if(session.student.var4)
			_icons += `<i class="fa fa-${this.icons.fourth} norm-icon" aria-hidden="true"></i>`;
		if(session.overwriteVar5 && session.overwriteVar5[instance] === true)
			_icons += `<i class="fa fa-${this.icons.fifth} norm-icon" aria-hidden="true"></i>`;
		if(session.overwriteVar6 && session.overwriteVar6[instance] === true)
			_icons += `<i class="fa fa-${this.icons.sixth} norm-icon" aria-hidden="true"></i>`;
		if(session.student.grade == 12)
			_icons += '<i class="fa fa-' + this.icons.year12 + ' grade-12" aria-hidden="true"></i>';
		if(_icons)
			_div.innerHTML += '<div class="icon-row">' + _icons + '</div>';

		_div.innerHTML += '<div class="a-bg ' + 'aa' + color + '"></div>';

		

		var _start = this.StartFinder(session, instance);
		var _room = (session.overwriteRoom && instance in session.overwriteRoom) ? session.overwriteRoom[instance] : session.room;
		var _targ = document.getElementById('t' + _start + 'r' + _room);

		_targ && _targ.insertBefore(_div, null);
	}

	isCurrentDay(index){
		return this.calendarDate.getDay() === index;
	}

	setDayOfWeek(index){
		this.changingDay = true;
		const newIndex = (index + 1) % 7;

		var targetDate = this.calendarDate.getDate() + (newIndex - this.calendarDate.getDay());
		if(this.calendarDate.getDay() === 0){ //if currently sunday
			targetDate -= 7;
		} else if(newIndex === 0){ //if moving to sunday
			targetDate += 7;
		}
		
		this.calendarDate = new Date(this.calendarDate.setDate(targetDate))
		this.clearCal();
	}

	createArray(length){
		return Array.apply(null, Array(length)).map(function (x, i) { return i; })
	}

	addDays(days){
		//calendarDate is re-int bc watcher won't update
		//with regular setTime()
		//hacky fix
		this.changingDay = true;
		this.calendarDate = new Date(this.calendarDate.getTime() + (days * 86400000));
		this.clearCal();
	}

	changeLocation(location){
		this.changingDay = true;
		this.location = location;
		this.clearCal(true);
	}
}