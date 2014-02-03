var mongoose = require('mongoose');
var Task = require('../models/task-model');

exports.personalDashboard = function(req, res){
	Task.find({'meetingPerson' : req.user.local.email, 'isComplete' : 0}, function(e, docs){
		res.render('personalDashboard', {
			'userlist': docs,
			user : req.user
		});
	});
};

exports.personalDashboard2 = function(req, res){
	Task.find({}, function(e, docs){
			res.render('personalDashboard2', {
				'userlist': docs,
				 user : req.user
			});
		});
};

exports.meetingTask = function(req, res){
	Task.find({}, function(e, docs){
		console.log(docs);
		res.render('meetingTask', {
			'taskList': docs,
			user : req.user
		});
	});
};

exports.meetingTaskDone = function(req, res){
	Task.find({}, function(e, docs){
		res.render('meetingTask2', {
			'userlist': docs
		});
	});
};

exports.finishTask = function(req, res){
	var meetingId = req.body.meetingId;
	// console.log(meetingId);
	Task.findByIdAndUpdate(meetingId, {
		'isComplete' : 1
	}, function(e, result){
		if(e) console.log(e);
		else console.log("Successfully finished task");
	});
	res.redirect('back');
}

exports.deleteTask = function(req, res){
	var meetingId = req.body.meetingId;
	// console.log(meetingId);
	Task.findByIdAndRemove(meetingId, 
		function(e, result){
			if(e) console.log(e);
			else console.log("Successfully deleted task");
	});
	res.redirect('back');
}

exports.addTask = function(req, res){
	var userTaskName = req.body.taskName;
	var userDate = req.body.taskDate;
	var userPerson = req.body.taskPerson;
	var allUsers = userPerson.split(', ');

	for(i=0; i< allUsers.length; i++)
	{
		if(allUsers[i] != "")
		{
			var newTask = new Task({
				meetingTask: userTaskName,
		    	meetingDate: userDate,
		   		meetingPerson: allUsers[i]
			});

			newTask.save(function(err, doc){
				if(err){
					console.log('Problem adding information to database')
					res.location('error');
					res.redirect('error', {user : req.user});
				}
				else{
					console.log('Added new Task successfully');
					Task.find({}, function(e, docs){console.log(docs);});
				}
			});
		}
	}
	res.redirect('back');
};

exports.profile = function(req, res){
	res.render('profile', {user : req.user});
};