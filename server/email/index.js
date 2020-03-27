var nodemailer = require('nodemailer');
var mg = require('nodemailer-mailgun-transport');
var ejs = require('ejs');
var async = require('async');

var auth = {
  auth: {
    api_key: 'key-d9499f4127dd8417e5771adb972f34e2',
    domain: 'mg.gsptcal.com.au',
  }
};

var nodemail = nodemailer.createTransport(mg(auth));

  
export function sendEmail(from, to, subject, schedule, content, tutor, emailAddress){

	ejs.renderFile(__dirname + '\/templates\/tutor-schedule.ejs', {schedule, content, tutor, emailAddress}, function (err, data) {
		if (err) {
			console.log("Error rendering e-mail template");
			console.log(err);
		} else {
			var mainOptions = {
				from,
				to,
				subject,
				html: data
			};
			nodemail.sendMail(mainOptions, function (err, info) {
				if (err) {
					console.log(err);
				} 
			});
		}		
	});

}

export async function sendEmailReminder(from, to, subject, studentsInfo){
	console.log("send emails");
	async.forEach(studentsInfo, (studentInfo) => {
		ejs.renderFile(__dirname + '\/templates\/student-schedule-notif.ejs', {studentInfo}, function (err, data) {
			if (err) {
				console.log("Error rendering e-mail template");
				console.log(err);
			} else {
				var mainOptions = {
					from,
					to,
					subject,
					html: data
				};
				nodemail.sendMail(mainOptions, function (err, info) {
					if (err) {
						console.log(err);
					} 
				});
			}		
		});
	});
	console.log("asynchronous function call done");

}
