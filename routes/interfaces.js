var mongoose = require('mongoose');
var Meeting = require('../models/meeting-model');
var Task = require('../models/task-model');

exports.makeMeeting = function(req, res){
	Meeting.find({'UserId' : req.user.local.email}, function(e, docs){
		res.render('makeMeeting', { 
			title: 'SEAM', 
			meetingList: docs,
			user : req.user
		});
	})
};

exports.meeting = function(req, res){
	var meetingId = req.body.meetingId;
	if(meetingId == undefined){
		meetingId = req.session.meetingId;
	}
	else{
		req.session.meetingId = meetingId;
	}
	console.log(meetingId);
	Meeting.findOne({'_id': meetingId}, function(e, doc){
		console.log(doc);
		Task.find({'MeetingId': meetingId}, function(e, task){
			console.log(task);
			res.render('meeting', { 
				title: 'SEAM',
				taskList: task,
				meeting: doc,
				user : req.user,
				past : 0
			});
		})
	})
};

exports.pastMeeting = function(req, res){
	var meetingId = req.body.meetingId;
	if(meetingId == undefined){
		meetingId = req.session.meetingId;
	}
	else{
		req.session.meetingId = meetingId;
	}
	console.log(meetingId);
	Meeting.findOne({'_id': meetingId}, function(e, doc){
		console.log(doc);
		Task.find({'MeetingId': meetingId}, function(e, task){
			console.log(task);
			res.render('meeting', { 
				title: 'SEAM',
				taskList: task,
				meeting: doc,
				user : req.user,
				past : 1
			});
		})
	})
};

exports.newMeeting = function(req, res){
	Meeting.find({'UserId' : req.user.local.email}, function(e, docs){
		res.render('newMeeting', { 
			title: 'SEAM', 
			meetingList: docs,
			user : req.user
		});
	})
};

exports.projects = function(req, res){
	res.render('projects', { title: 'SEAM', user : req.user});
};

exports.startMeeting = function(req, res){
	var meetingId = req.body.meetingId;
	if(meetingId == undefined){
		meetingId = req.session.meetingId;
	}
	else{
		req.session.meetingId = meetingId;
	}
	console.log(meetingId);
	Meeting.find({'UserId' : req.user.local.email}, function(e, docs){
		Meeting.findOne({'_id': meetingId}, function(e, doc){
			console.log(doc);
			res.render('startMeeting', { 
				title: 'SEAM',
				meeting: doc,
				meetingList: docs,
				user : req.user,
				past : 0
			});
		})
	})
};

exports.viewPastMeeting = function(req, res){
	var meetingId = req.body.meetingId;
	if(meetingId == undefined){
		meetingId = req.session.meetingId;
	}
	else{
		req.session.meetingId = meetingId;
	}
	console.log(meetingId);
	Meeting.find({'UserId' : req.user.local.email}, function(e, docs){
		Meeting.findOne({'_id': meetingId}, function(e, doc){
			console.log(doc);
			res.render('startMeeting', { 
				title: 'SEAM',
				meeting: doc,
				meetingList: docs,
				user : req.user,
				past : 1
			});
		})
	})
};

exports.finishMeeting = function(req, res){
	var meetingId = req.session.meetingId;
	// console.log(meetingId);
	Meeting.findByIdAndUpdate(meetingId, {
		'isComplete' : 1
	}, function(e, result){
		if(e) console.log(e);
		else console.log("Successfully finished meeting");
	});
	res.redirect('welcome');
}

exports.tasks = function(req, res){
	res.render('tasks', { title: 'SEAM', user : req.user});
};

exports.welcome = function(req, res){
	res.render('welcome', { title: 'SEAM', user : req.user});
};

exports.sidebarMeetings = function(req, res){
	Meeting.find({'UserId' : req.user.local.email}, function(e, docs){
		res.render('sidebarMeetings', { 
			title: 'SEAM', 
			meetingList: docs,
			user : req.user
		});
	})
};

exports.sidebarNavbar = function(req, res){
	res.render('sidebarNavbar', { title: 'SEAM', user : req.user});
};

exports.sidebarTasks = function(req, res){
	res.render('sidebarTasks', { title: 'SEAM', user : req.user});
};

exports.addTask = function(req, res){
	var meetingTask = req.body.notes;
	var meetingPerson = req.body.assigned;
	var meetingId = req.session.meetingId;
	var userId = req.session.userId;

	for(var i=0; i<meetingPerson.length; i++){
		if(meetingPerson[i] != ""){
			var newTask = new Task({
				UserId: userId,
				MeetingId: meetingId,
				meetingTask: meetingTask,
				meetingPerson: meetingPerson[i]
			});

			newTask.save(function(err, doc){
				if(err){
					console.log('Problem adding task to database')
					console.log(err);
					res.location('error');
					res.redirect('error', {user : req.user});
				}
				else{
					console.log('Added new task successfully');
					Task.find({}, function(e, docs){console.log(docs);});
				}
			});
		}
	}
	res.redirect('back');
}

exports.addNote = function(req, res){
	var noteOrder = req.body.noteOrder;
	var meetingId = req.body.meetingId;
	var notes = req.body.notes;
	Meeting.findOne({'_id': meetingId}, function(e, doc){
		doc.agenda[noteOrder].notes.push({notes: notes});
		doc.save(function(err, doc){
			if(err){
				console.log('Problem adding notes to database')
				console.log(err);
				res.location('error');
				res.redirect('error', {user : req.user});
			}
			else{
				console.log('Added notes successfully');
				Meeting.find({}, function(e, docs){console.log(docs);});
			}
		});	
		res.redirect('back');
	})
};

exports.addMeeting = function(req, res){
	var userId = req.user.local.email;
	var meetingTitle = req.body.meetingTitle;
	var objective = req.body.objective;
	var agenda = req.body.agendaTopic;
	var duration = req.body.duration;
	var meetingTime = req.body.meetingTime;
	console.log(userId + meetingTitle + objective + agenda + duration);
 
	var newMeeting = new Meeting({
		UserId: userId,
		meetingTitle: meetingTitle,
		objective: objective,
		meetingTime: meetingTime
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
			console.log(err);
			res.location('error');
			res.redirect('error', {user : req.user});
		}
		else{
			console.log('Added new meeting successfully');
			Meeting.find({}, function(e, docs){console.log(docs);});
		}
	});

	res.redirect('back');
};