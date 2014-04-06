var mongoose = require('mongoose');
var Task = require('../models/task-model');
var Meeting = require('../models/meeting-model');

exports.getTasks = function(req, res){
	Meeting.find({'UserId' : req.user.local.email, 'isComplete' : 1}, function(e, docs){
		console.log(docs);
		res.render('loggedIn/tasks/tasks', { 
			title: 'SEAM', 
			name: req.session.name,
			meetingList: docs
 		});
	});
}

exports.getTasksByMeeting = function(req, res){
	console.log(req);

	var meetingId = req.body.meetingId;

	console.log('inside server: ' + meetingId);

	Task.find({'MeetingId': meetingId, 'UserId' :  req.session.userId}, function(e, doc){
		res.json({'tasks' : doc});
	});
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