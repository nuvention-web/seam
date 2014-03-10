var mongoose = require('mongoose');
var Task = require('../models/task-model');

exports.getTasks=function(req, res){
	res.render('loggedIn/tasks/tasks', { title: 'SEAM', user : req.user});
}

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