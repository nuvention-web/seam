var mongoose = require('mongoose');
var Meeting = require('../models/meeting-model');
var Project = require('../models/project-model');

// exports.dashboard = function(req, res){
// 	res.render('loggedIn/dashboard/welcome', { 
// 		title: 'SEAM',
// 		name: req.session.name,
// 		user : req.user});
// };

// exports.setWelcome = function(req, res){
// 	console.log(projectId);
// 	Project.findOne({'_id': projectId}, function(e, doc){
// 		console.log(doc);
// 		res.render('loggedIn/dashboard/welcome', { 
// 			title: 'SEAM',
// 			projectName: req.session.projectName,
// 			project: doc,
// 			user : req.user,
// 		});
// 	})
// };

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
		projectName: req.session.projectName, 
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