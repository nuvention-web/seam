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
	Meeting.find({'UserId' : req.user.local.email, 'isComplete' : 0}).sort({meetingTime: 1}).exec(function(e, meetingList){
		Meeting.find({'UserId' : req.user.local.email, 'isComplete' : 1}).sort({meetingTime: 1}).exec(function(e, finMeetingList){
			var meetingTime = new Array();

			for(var i = 0; i < meetingList.length; i++){
				var date = meetingList[i].meetingTime;
				var duration = meetingList[i].duration;
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
				meetingTime[i] = timeString;
				console.log(meetingTime[i]);
			}

			res.render('loggedIn/dashboard/dashboard', { 
				title: 'SEAM', 
				upcomingMeeting: meetingList[0],
				previousMeeting: finMeetingList[0],
				meetingList: meetingList,
				meetingTime: meetingTime,
				pastMeetingList: finMeetingList,
				name: req.session.name,
				user : req.user
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