var mongoose = require('mongoose');
var Task = require('../models/task-model');

exports.personalDashboard = function(req, res){
	Task.find({}, function(e, docs){
			res.render('personalDashboard', {
				'userlist': docs
			});
		});
};

exports.personalDashboard2 = function(req, res){
	Task.find({}, function(e, docs){
			res.render('personalDashboard2', {
				'userlist': docs
			});
		});
};

exports.meetingTask = function(req, res){
	res.render('meetingTask', {title: 'meetingTask'});
};

exports.meetingTaskDone = function(req, res){
	Task.find({}, function(e, docs){
			res.render('meetingTask2', {
				'userlist': docs
			});
		});
	
};

exports.addTask = function(req, res){
	var userTaskName = req.body.taskName;
	var userDate = req.body.taskDate;
	var userPerson = req.body.taskPerson;

	var newTask = new Task({
		meetingTask: userTaskName,
    	meetingDate: userDate,
   		meetingPerson: userPerson
	});

	newTask.save(function(err, doc){
		if(err){
			console.log('Problem adding information to database')
			res.location('error');
			res.redirect('error');
		}
		else{
			console.log('Added new Task successfully');
			Task.find({}, function(e, docs){console.log(docs);});
			res.location('meetingTask2');
			res.redirect('meetingTask2');
		}
	});
};

exports.profile = function(req, res){
	res.render('profile', {title : 'MeetingBuddy!'});
}