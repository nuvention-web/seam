var mongoose = require('mongoose');
var Meeting = require('../models/meeting-model');
var nodemailer = require('nodemailer');

exports.contact = function(req, res){
	res.render('loggedIn/dashboard/contact', { title: 'SEAM',
		name: req.session.name,
		user : req.session.userId});
};
exports.feedbackForm = function(req, res){
	console.log("hi");
	var names = req.body.names;
	var emails = req.body.email;
	var comments = req.body.comments;
	var smptpConfig;
	//email function
	smtpConfig = nodemailer.createTransport('SMTP', {
	service: 'Gmail',
	auth: {
		user: "seammeetingscontact@gmail.com",
	 	pass: "123456789a!"
	}
	 });
	emailBody = {
		 	from: "SEAM Meetings <seammeetingscontact@gmail.com>",
			to: 'miketychen@gmail.com',
		 	subject: '[SEAM] Feedback: '+names,
		 	text: 'Name: '+names+'\nEmail: '+ emails+'\nComments: '+comments
	 };
	//send Email
	 smtpConfig.sendMail(emailBody, function (error, response) {
	//Email not sent
 	if (error) {
		res.end("Email Failed");
 	}
 	//email send sucessfully
	else {
		res.end("Email Successfully");
 	}

 });

	res.redirect('/dashboard');
};
exports.dashboard = function(req, res){

	var userId = req.session.userId;
	var userMail

	if(req.session.email==undefined){
		userMail = req.session.userId;
	}else{
		userMail = req.session.email;
	}

	console.log("THIS IS THE USERID: " + userId);

	Meeting.find({ $or: [{'UserId' : userId, 'isComplete' : 0}, {'attendees.attendeeEmail' : userMail, 'isComplete' : 0}]}).sort({meetingDate: 1}).exec(function(e, meetingList){
		Meeting.find({ $or: [{'UserId' : userId, 'isComplete' : 1}, {'attendees.attendeeEmail' : userMail, 'isComplete' : 1}]}).sort({meetingDate: -1}).exec(function(e, finMeetingList){
			var meetingDate = new Array();

			for(var i = 0; i < meetingList.length; i++){
				if(meetingList[i].meetingDate != undefined){
					var date = meetingList[i].meetingDate;
					var duration = meetingList[i].meetingTime;
					var year = date.getFullYear();
					var month = date.getMonth() + 1;
					var day = date.getDate();
					var startHour = date.getHours();
					var startMinutes = date.getMinutes();
					if(startHour > 12){
						startHour = startHour%12;
					}
					if(startMinutes < 10){
						startMinutes = "0" + startMinutes;
					}
					var endDate = addMinutes(date, duration);
					var endHour = endDate.getHours();
					var endMinutes = endDate.getMinutes();
					if(endHour > 12){
						endHour = endHour%12;
					}
					if(endMinutes < 10){
						endMinutes = "0" + endMinutes;
					}				
					var timeString = month + "/" + day + "/" + year + " " + startHour + ":" + startMinutes + " - " + endHour + ":" + endMinutes; 
					meetingDate[i] = timeString;
					console.log(meetingDate[i]);
				}
			}

			res.render('loggedIn/dashboard/dashboard', { 
				title: 'SEAM', 
				upcomingMeeting: meetingList[0],
				previousMeeting: finMeetingList[0],
				meetingList: meetingList,
				meetingDate: meetingDate,
				pastMeetingList: finMeetingList,
				name: req.session.name,
				user : userId
			});
		});
	})
};

exports.tasks = function(req, res){
	res.render('loggedIn/dashboard/sidebarTasks', { 
		title: 'SEAM',
		user : req.user});
};

function addMinutes(date, minutes){
	return new Date(date.getTime() + minutes*60000);
}

//Function that returns email if it is Google Login and email if local
function getCreatorEmail(req,userId){

	if(req.session.email==undefined){
		return userId;
	}else{
		return req.session.email;
	}
}