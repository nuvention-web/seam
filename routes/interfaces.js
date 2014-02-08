var mongoose = require('mongoose');
var Meeting = require('../models/meeting-model');

exports.PMInterface = function(req, res){
	Meeting.find({'UserId' : req.user.local.email}, function(e, docs){
		res.render('PMInterface', { 
			title: 'SEAM', 
			meetingList: docs,
			user : req.user
		});
	})
};
exports.welcomeInterface = function(req, res){
	res.render('welcomeInterface', { title: 'SEAM', user : req.user});
};
exports.meetingInterface = function(req, res){
	res.render('meetingInterface', { title: 'SEAM', user : req.user});
};
exports.taskInterface = function(req, res){
	res.render('taskInterface', { title: 'SEAM', user : req.user});
};

exports.addMeeting = function(req, res){
	var userId = req.user.local.email;
	var meetingTitle = req.body.meetingTitle;
	var objective = req.body.objective;
	var agenda = req.body.agendaTopic;
	var duration = req.body.duration;

	console.log(userId + meetingTitle + objective + agenda + duration);

	var newMeeting = new Meeting({
		UserId: userId,
		meetingTitle: meetingTitle,
		objective: objective
	});

	for(var i=0; i<agenda.length; i++){
		newMeeting.agenda.push({
			topic: agenda[i],
			duration: duration[i]
		});
	}

	newMeeting.save(function(err, doc){
		if(err){
			console.log('Problem adding information to database')
			res.location('error');
			res.redirect('error', {user : req.user});
		}
		else{
			console.log('Added new meeeting successfully');
			Meeting.find({}, function(e, docs){console.log(docs);});
		}
	});

	res.redirect('back');
};