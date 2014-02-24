var mongoose = require('mongoose');
var Meeting = require('../models/meeting-model');
var Task = require('../models/task-model');
var Project = require('../models/project-model');

exports.welcome = function(req, res){
	Project.find({'UserId' : req.user.local.email}, function(e, docs){
		res.render('loggedIn/projects/projects', { 
			title: 'SEAM', 
			projectList: docs,
			user : req.user,
			name : req.session.name
		});
	})
};

exports.addProject = function(req, res){
	var projectName = req.body.projectName;
	var userId = req.user.local.email;
	var newProject = new Project({
		UserId : userId,
		projectName : projectName
	});

	newProject.save(function(err, doc){
		if(err){
			console.log('Problem adding project to database')
			console.log(err);
			res.location('error');
			res.redirect('error', {user : req.user});
		}
		else{
			console.log('Added new project successfully');
			Project.find({}, function(e, docs){console.log(docs);});
		}
	});

	res.redirect('back');
};
