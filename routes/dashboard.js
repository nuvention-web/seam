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
	Meeting.find({'UserId' : req.user.local.email, 'isComplete' : 0}, function(e, meetingList){
		Meeting.find({'UserId' : req.user.local.email, 'isComplete' : 1}, function(e, finMeetingList){
			res.render('loggedIn/dashboard/dashboard', { 
				title: 'SEAM', 
				upcomingMeeting: meetingList[0],
				previousMeeting: finMeetingList[0],
				meetingList: meetingList,
				pastMeetingList: finMeetingList,
				name: req.session.name,
				user : req.user
			});
		})
	})
};
