var nodemailer = require('nodemailer');
var mg = require('nodemailer-mailgun-transport');
var ejs = require('ejs');

var auth = {
  auth: {
    api_key: 'key-d9499f4127dd8417e5771adb972f34e2',
    domain: 'mg.gsptcal.com.au',
  }
};

var nodemail = nodemailer.createTransport(mg(auth));

export function sendEmail(from, to, subject, html){
	nodemail.sendMail({
		from,
		to, 
		subject,
		html,
	}); 
}