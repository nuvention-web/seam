var mongoose = require('mongoose');
var Meeting = require('../models/meeting-model');
var Project = require('../models/project-model');

exports.welcome = function(req, res){
	res.render('loggedIn/dashboard/welcome', { 
		title: 'SEAM',
		projectName: req.session.projectName,
		user : req.user});
};

exports.setWelcome = function(req, res){
	var projectId = req.body.projectId;
	var projectName = req.body.projectName;
	if(projectId == undefined){
		projectId = req.session.projectId;
		projectName = req.session.projectName;
	}
	else{
		req.session.projectId = projectId;
		req.session.projectName = projectName;
	}
	console.log(projectId);
	Project.findOne({'_id': projectId}, function(e, doc){
		console.log(doc);
		res.render('loggedIn/dashboard/welcome', { 
			title: 'SEAM',
			projectName: req.session.projectName,
			project: doc,
			user : req.user,
		});
	})
};

exports.meetings = function(req, res){
	Meeting.find({'ProjectId': req.session.projectId, 'UserId' : req.user.local.email}, function(e, docs){
		res.render('loggedIn/dashboard/sidebarMeetings', { 
			title: 'SEAM', 
			projectName: req.session.projectName,
			meetingList: docs,
			user : req.user
		});
	})
};

exports.tasks = function(req, res){
	res.render('loggedIn/dashboard/sidebarTasks', { 
		title: 'SEAM',
		projectName: req.session.projectName, 
		user : req.user});
};

