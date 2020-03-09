'use strict';

export default class {
	/*@ngInject*/
	constructor($http, $filter, ColorFinder, DateFinder, ValidIndexes){
		this.$http = $http;
		this.$filter = $filter;
		this.ColorFinder = ColorFinder;
		this.DateFinder = DateFinder;
		this.ValidIndexes = ValidIndexes;
	}

	$onInit(){
		this.$http.get('/api/students')
	      .then(response => {
	        this.students = response.data;
	      });

	    this.$http.get('/api/icons')
	      .then(response => {
	        this.icons = response.data[0] || {
	        	first: '',
	        	second: '',
	        	third: '',
	        	fourth: '',
	        	fifth: '',
	        	sixth: '',
	        	year12: '',
	        };
		  });
		  
		this.$http.get('/api/termsettings')
	      .then(response => {
			if (response && response.data && response.data[0]) {
				console.log(response.data[0]);
				this.term = {
					termNo : response.data[0].termNo,
					startDate : Date.parse(response.data[0].startDate) ,
					endDate : Date.parse(response.data[0].endDate),
					sixthSunday : response.data[0].sixthSunday
				}
			}  else {
	        	this.term = {
					termNo: '',
					startDate: '',
					endDate: '',
					sixthSunday: ''
				};
	        }
		  });
		this.$http.get('/api/lessons').then(response => {
			this.sessions = response.data;
		});


		this.isSandbox = location.hostname.includes('sandbox');
		this.loading = false; 
	}

	resetDatabase(){
		if(confirm('Are you sure you want to refresh the database?')){
      		this.$http.get('/api/users/new-database')
    	}
	}


	addYear(){
	    if(confirm('Are you sure you want to do this?')){
	      this.students.forEach(student => {
	        //If student is not in uni
	        if(!student.isTertiary){
	          if(student.grade == 12){
	            student.isTertiary = true;
	            student.isActive = false;
	          } else {
	            student.grade++;
	          }
	          //now save student
	          this.$http.put('/api/students/' + String(student._id), student);
	        }
	      })
	    }
	}

    saveIcons(){
    	this.success = false;
    	this.fail = false;
    	if(this.icons._id){
    		this.$http.put('/api/icons/' + String(this.icons._id), this.icons).then(res =>{
    			this.success = true;
    		}).catch(res =>{
    			this.fail = true;
    		});
    	} else {
    		this.$http.post('/api/icons', this.icons).then(res =>{
    			this.success = true;
    		}).catch(res =>{
    			this.fail = true;
    		});
    	}
	}
	
	updateSettings(){
		this.success = false;
		this.fail = false;
		
		if(this.term._id){
    		this.$http.put('/api/termsettings/' + String(this.term._id), this.term).then(res =>{
    			this.term.success = true;
    		}).catch(res =>{
    			this.term.fail = true;
    		});
    	} else {
    		this.$http.post('/api/termsettings', this.term).then(res =>{
    			this.term.success = true;
    		}).catch(res =>{
    			this.term.fail = true;
    		});
    	}

		getWeekendsOfTerm();
	}

	generateEmails(){
		if(confirm('Are you sure you want to send student e-mails?')){
			this.loading = true;
			// ++++++++++++++++++++ get student sessions here
			
			var start = new Date(this.term.startDate);
			var end = new Date(this.term.endDate);
			var termNo = this.term.termNo 
			var sixthSunday = this.term.sixthSunday;
			var studentIds = this.getStudentIds();
			
			var studentSessions = this.sessions.filter(session => studentIds.has(session.clientUID));
		
			
			var sessionData = [];
			studentSessions.forEach(session => {
			const validIndexes = this.ValidIndexes(session, start, end);
				validIndexes.forEach(index => {
			
					const sessionDate = this.DateFinder(session, index);
					const formattedDate = this.$filter('toDateString')(sessionDate);
					const parsedDate = this.$filter('reparseDate')(formattedDate);
					const color = this.ColorFinder(session, index);
					sessionData.push({
						clientUID: session.clientUID,
						duration: session.duration / 60,
						sessionDate,
						date: parsedDate,
						color
					});
			
				});
			});

			sessionData = sessionData.filter(session => {
				var acceptedColors = ['blue', 'dark blue', 'green', 'dark green', 'purple', 'dark purple'];
				var color = session.color.toLowerCase();
				return acceptedColors.includes(color);
			});
			
			sessionData = sessionData.sort((a, b) => {
				if (a.sessionDate < b.sessionDate) {
					return -1;
				}
		
				if (a.sessionDate > b.sessionDate) {
					return 1;
				}
		
				if (a.basicTime < b.basicTime) {
					return -1;
				}
		
				if (a.basicTime > b.basicTime) {
					return 1;
				}
		
				return 0;
			});
		

			var studentsData = [];
			var weekEnderResults = this.getWeekendsOfTerm();
			studentIds.forEach(sID => {
				var sessionsForStudent = sessionData.filter(session => session.clientUID == sID);
				let weekListInfo = this.retrieveHoursPerWeek(weekEnderResults, sessionsForStudent);
				var student = this.students.find(s=> s._id == sID);
				studentsData.push({
					clientEmailAddress: student.clientEmail,
					clientName: student.clientFirstName,
					studentName: student.firstName,
					termNo,
					sixthSunday,
					hoursCompleted : weekListInfo.hoursCompleted,
					hoursToFinish: 10 - weekListInfo.hoursCompleted,
					weekList : weekListInfo.weekList
				}); 
			})
		
			studentsData = studentsData.filter(s => s.clientEmailAddress != "contact@gspt.com.au");
			console.log(studentsData);
		
		
			studentsData.forEach(studentInfo => {
				this.$http.post('/api/students/send-email-notif', {
					subject: `Tuition Schedule to Finish Term ${termNo}`,
					studentInfo
				});
			})
			
		}
		this.loading = false; 

	}


	retrieveHoursPerWeek(weekEnderResults, sessionData){
			var hoursCompleted = 0;
			var weekListInfo = {
				hoursCompleted:0,
				weekList:[]
			};
		
			weekEnderResults.forEach((weekend, i, weekends) => {
				var weekendDate = new Date(weekend.value);
				weekend.duration = 0; 
				sessionData.forEach(session => {
					let sessionDate = new Date(session.date);
					if(i==0 && sessionDate <= weekendDate){
						weekend.duration += session.duration;
					} else if(i>0){
						var weekendStart = new Date(weekends[i-1].value);
						if(sessionDate >= weekendStart && sessionDate <= weekendDate){
							weekend.duration += session.duration;
						}
					}
				});
				
			
				var month = ("0" + (weekendDate.getMonth() + 1)).slice(-2);
				var date = ("0" + weekendDate.getDate()).slice(-2);
		
				var status = i > 4 ? `Scheduled` : `Completed`; 
				var toBeRescheduled = false;
				if (i >= 0 && i <= 4) {
					weekListInfo.hoursCompleted += weekend.duration;
					if(weekend.duration ==0){
						status  += " (To Be Rescheduled)";
						toBeRescheduled = true;
					}
				} else if (i == 9) {
					status += `  (Does This Session Need To Be Rescheduled?)`;
				}
				weekListInfo.weekList.push({
					value:	`Week Ending ${date}/${month} - ${weekend.duration} Hour ${status}`,
					toBeRescheduled
				}); 
		
			}); 
			return weekListInfo;
	}
	getStudentIds(){
		var weekEnderResults = this.getWeekendsOfTerm(); 

		var start = new Date(weekEnderResults[4].value);
		start.setDate(start.getDate()+1);
		var end = new Date(weekEnderResults[5].value);

		console.log("Start date:"  + start);
		console.log("End date"+ end);

		var studentIds = [];

		var sessions = this.sessions.map(session => {
			if (!session.student && session.clientUID) {
				session.student = this.students.find(s => s._id === session.clientUID);
			}
			return session;
		});
		sessions.forEach(session => {
			const validIndexes = this.ValidIndexes(session, start, end);
	  
			validIndexes.forEach(index => {
				const sessionDate = this.DateFinder(session, index);
				const formattedDate = this.$filter('toDateString')(sessionDate);
				const parsedDate = this.$filter('reparseDate')(formattedDate);
				const color = this.ColorFinder(session, index);
				studentIds.push(session.clientUID);
			});
		});


		studentIds = new Set(studentIds.sort());
		var studentEmailInfo = [];
		studentIds.forEach(studentId => {
			var student = this.students.find(s => s._id == studentId);
			studentEmailInfo.push({
				clientEmailAddress: student.clientEmail,
				clientName: student.clientFirstName,
				studentName: student.firstName
			});
		});

		return studentIds;
	}

	getWeekendsOfTerm(){

		console.log(this.term);
		var start = new Date(this.term.startDate);
		var end = new Date(this.term.endDate);
		var weekEnderResults = [];
		var day = 0;
		var current = new Date(start);
	
		current.setDate(current.getDate() + (day - current.getDay() + 7) % 7);
		end.setDate(end.getDate() + ((7 - end.getDay()) % 7));
	
		while (current <= end) {
			var weekEnder = new Date(+current);
				weekEnderResults.push({
					value : weekEnder,
					duration :0
				});
			current.setDate(current.getDate() + 7);
		}

		return weekEnderResults; 
	}
 }