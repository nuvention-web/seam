var mongoose = require('mongoose');
var Meeting = require('../models/meeting-model');
var Task = require('../models/task-model');
var Project = require('../models/project-model');

exports.makeMeeting = function(req, res){
	Meeting.find({'ProjectId': req.session.projectId, 'UserId' : req.user.local.email}, function(e, docs){
		res.render('makeMeeting', { 
			title: 'SEAM',
			projectName: req.session.projectName,
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
	Meeting.findOne({'ProjectId': req.session.projectId, '_id': meetingId}, function(e, doc){
		console.log(doc);
		Task.find({'ProjectId': req.session.projectId, 'MeetingId': meetingId}, function(e, task){
			console.log(task);
			res.render('meeting', { 
				title: 'SEAM',
				projectName: req.session.projectName,
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
	Meeting.findOne({'ProjectId': req.session.projectId, '_id': meetingId}, function(e, doc){
		console.log(doc);
		Task.find({'ProjectId': req.session.projectId, 'MeetingId': meetingId}, function(e, task){
			console.log(task);
			res.render('meeting', { 
				title: 'SEAM',
				taskList: task,
				meeting: doc,
				projectName: req.session.projectName,
				user : req.user,
				past : 1
			});
		})
	})
};

exports.newMeeting = function(req, res){
	Meeting.find({'ProjectId': req.session.projectId, 'UserId' : req.user.local.email}, function(e, docs){
		res.render('newMeeting', { 
			title: 'SEAM', 
			meetingList: docs,
			projectName: req.session.projectName,
			user : req.user
		});
	})
};

exports.projects = function(req, res){
	Project.find({'UserId' : req.user.local.email}, function(e, docs){
		res.render('projects', { 
			title: 'SEAM', 
			projectList: docs,
			user : req.user,
			name : req.session.name
		});
	})
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
	Meeting.find({'ProjectId': req.session.projectId, 'UserId' : req.user.local.email}, function(e, docs){
		Meeting.findOne({'ProjectId': req.session.projectId, '_id': meetingId}, function(e, doc){
			console.log(doc);
			res.render('startMeeting', { 
				title: 'SEAM',
				meeting: doc,
				projectName: req.session.projectName,
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
	Meeting.find({'ProjectId': req.session.projectId, 'UserId' : req.user.local.email}, function(e, docs){
		Meeting.findOne({'_id': meetingId}, function(e, doc){
			console.log(doc);
			res.render('startMeeting', { 
				title: 'SEAM',
				projectName: req.session.projectName,
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
		res.render('welcome', { 
			title: 'SEAM',
			projectName: req.session.projectName,
			project: doc,
			user : req.user,
		});
	})
}

exports.welcome = function(req, res){
	res.render('welcome', { 
		title: 'SEAM',
		projectName: req.session.projectName,
		user : req.user});
};

exports.sidebarMeetings = function(req, res){
	Meeting.find({'ProjectId': req.session.projectId, 'UserId' : req.user.local.email}, function(e, docs){
		res.render('sidebarMeetings', { 
			title: 'SEAM', 
			projectName: req.session.projectName,
			meetingList: docs,
			user : req.user
		});
	})
};

exports.sidebarNavbar = function(req, res){
	res.render('sidebarNavbar', { 
		title: 'SEAM',
		projectName: req.session.projectName,
		user : req.user});
};

exports.sidebarTasks = function(req, res){
	res.render('sidebarTasks', { 
		title: 'SEAM',
		projectName: req.session.projectName, 
		user : req.user});
};

exports.addTask = function(req, res){
	var meetingTask = req.body.notes;
	var meetingPerson = req.body.assigned;
	var meetingId = req.session.meetingId;
	var projectId = req.session.projectId;
	var userId = req.session.userId;

	for(var i=0; i<meetingPerson.length; i++){
		if(meetingPerson[i] != ""){
			var newTask = new Task({
				ProjectId: projectId,
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
	console.log(req.body);
	console.log(noteOrder + " " + meetingId + " " + notes);
	Meeting.findOne({'ProjectId': req.session.projectId, '_id': meetingId}, function(e, doc){
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

exports.addMeeting = function(req, res){
	var userId = req.user.local.email;
	var projectId = req.session.projectId;
	var meetingTitle = req.body.meetingTitle;
	var objective = req.body.objective;
	var agenda = req.body.agendaTopic;
	var duration = req.body.duration;
	var meetingTime = req.body.meetingTime;
	console.log(userId + meetingTitle + objective + agenda + duration);
 
	var newMeeting = new Meeting({
		ProjectId: projectId,
		UserId: userId,
		meetingTitle: meetingTitle,
		objective: objective,
		meetingTime: meetingTime
	});

	for(var i=0; i<agenda.length; i++){
		if(agenda[i] != ''){
			newMeeting.agenda.push({
				topic: agenda[i],
				duration: duration[i]
			});
		}
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