var mongoose = require('mongoose');
var Meeting = require('../models/meeting-model');
var Task = require('../models/task-model');
var Project = require('../models/project-model');
var nodemailer = require('nodemailer');

exports.makeMeeting = function(req, res){
	Meeting.find({'ProjectId': req.session.projectId, 'UserId' : req.user.local.email}, function(e, docs){
		res.render('loggedIn/meetings/makeMeeting', { 
			title: 'SEAM',
			projectName: req.session.projectName,
			meetingList: docs,
			name: req.session.name,
			user : req.user
		});
	})
};

exports.makeNewMeeting = function(req, res){
	Meeting.find({'ProjectId': req.session.projectId, 'UserId' : req.user.local.email}, function(e, docs){
		Project.findOne({'_id': req.session.projectId}, function(e, proj){
			res.render('loggedIn/meetings/makeNewMeeting', {
				memberList: proj.groupMembers,
				title: 'SEAM', 
				meetingList: docs,
				projectName: req.session.projectName,
				user : req.user
			});
		});
	})
};

exports.viewMeeting = function(req, res){
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
			res.render('loggedIn/meetings/viewMeeting', { 
				title: 'SEAM',
				meeting: doc,
				name: req.session.name,
				projectName: req.session.projectName,
				meetingList: docs,
				user : req.user,
				past : 0
			});
		})
	})
};

exports.postMeeting = function(req, res){

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
			res.render('loggedIn/meetings/startMeeting', { 
				title: 'SEAM',
				name: req.session.name,
				taskList: task,
				meeting: doc,
				user : req.user,
				past : 0
			});
		})
	})
};

exports.getMeeting = function(req, res){

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
			res.render('loggedIn/meetings/startMeeting', { 
				title: 'SEAM',
				taskList: task,
				meeting: doc,
				user : req.user,
				past : 0
			});
		})
	})
};

exports.endMeeting = function(req, res){
	var meetingId = req.session.meetingId;
	var meetingInfo;
	var mailBody, smtpConfig;
	var emailAgenda='';
	var agenda,meetingTitle,meetingDate,objective;
	// console.log(meetingId);
	Meeting.findByIdAndUpdate(meetingId, {
		'isComplete' : 1

	}, function(e, result){
		if(e) console.log(e);
		else console.log("Successfully finished meeting");
	});
	Meeting.find({'ProjectId': meetingId, 'UserId' : req.user.local.email}, function(e, docs){
		Meeting.findOne({'_id': meetingId}, function(e, doc){
			meetingInfo=doc;
			agenda=doc.agenda;
			if(typeof agenda == 'string'){
				emailAgenda+="<p style='text-align:left; text-transform:capitalize'> 1: "+agenda.topic+"<br/></p>";
			}
			else{
				for(var i=0; i<agenda.length; i++){
					console.log(agenda);
					console.log(agenda.length);
					if(agenda[i] != ''){
						var number= i+1;
						var notes= agenda[i].notes;
						emailAgenda+=number+':  '+ agenda[i].topic+'<br/>';
						for(var z=0; z<notes.length;z++){
							emailAgenda+="<p style='margin-left:5em; text-transform:capitalize'> " +String.fromCharCode(97 + z)+". "+notes[z].notes+"<br/></p>";
						}
					}
				};
			}

		// //email function
		// 	smtpConfig = nodemailer.createTransport('SMTP', {
		// 		service: 'Gmail',
		// 		auth: {
		// 			user: "seammeetings@gmail.com",
		// 			pass: "123456789a!"
		// 		}
		// 	});
		// 	//construct the email sending module
		// 	mailBody = {
		// 		forceEmbeddedImages: true,
		// 		from: "SEAM Meetings <seammeetings@gmail.com>",
		// 		to: meetingInfo.meetingMembers,
		// 		subject: '[ '+meetingInfo.meetingDate+' ] '+meetingInfo.meetingTitle+ ' Minutes',
		// 		text: 'Objectives: '+objective+'\n\n'+ 'Agenda: \n\n'+ emailAgenda,

		// 		// HTML body
		//     	html:"<body>"+
		//     	"<p style='text-align:center'><img src='cid:logo@seam'/></p>"+
		//         "<p style='text-align:left; text-transform:capitalize'> Date: "+meetingInfo.meetingDate+"<br/></p>" +
		//         "<p style='text-align:left; text-transform:capitalize'> Duration: "+meetingInfo.meetingTime+" Minutes <br/></p>" +
		//         "<p style='text-align:left; text-transform:capitalize'> Objectives: "+meetingInfo.objective+"<br/></p>" +
		//         "<p style='text-align:left; text-transform:capitalize'> Agenda: <br/></p>"+
		//         emailAgenda+
		//         "</body>",
		// 	    attachments:[
		// 	        // Logo img
		// 	        {
		// 	            filePath: './public/images/seamlogo-red125.png',
		// 	            cid: 'logo@seam' // should be as unique as possible
		// 	        },

		// 	    ]
		// 	};
		// 	//send Email
		// 	smtpConfig.sendMail(mailBody, function (error, response) {
		// 		//Email not sent
		// 		if (error) {
		// 			res.end("Email send Failed");
		// 		}
		// 		//email send sucessfully
		// 		else {
		// 			res.end("Email send sucessfully");
		// 		}
		// 	});
		});
	});
	res.redirect('dashboard');
}

exports.viewPast = function(req, res){
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
			res.render('loggedIn/meetings/viewMeeting', { 
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
			res.render('loggedIn/meetings/startMeeting', { 
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

exports.addNote = function(req, res){
	var noteOrder = req.body.noteOrder;
	var meetingId = req.session.meetingId;
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
};

exports.addMeeting = function(req, res){
	var mailBody, smtpConfig;
	var userId = req.user.local.email;
	var meetingTitle = req.body.meetingTitle;
	var objective = req.body.objective;
	var location = req.body.location;
	var agenda = req.body.agendaTopic;
	// var duration = req.body.duration;
	var meetingTime = req.body.meetingTime;
	var meetingStartTime = req.body.meetingStartTime;
	var meetingDate = req.body.meetingDate;  
	var attendeeNames = req.body.attendeeName;
	var attendeeEmails = req.body.attendeeEmail;
	var notes = req.body.notes;
	var emailAgenda='';
	// var timerInfo= meetingTime+','+duration;
	console.log(attendeeNames);
	console.log(attendeeEmails);
	console.log(attendeeNames[0]);
	console.log(attendeeEmails[0]);

	var newMeeting = new Meeting({
		UserId: userId,
		meetingTitle: meetingTitle,
		objective: objective,
		location: location,
		meetingDate: meetingDate,
		meetingStartTime:meetingStartTime,
		meetingTime: meetingTime,
		// timerInfo: timerInfo
	});

	if(typeof agenda == 'string'){
		emailAgenda+='1:  '+ agenda+'<br/>';
		newMeeting.agenda.push({
			topic: agenda,
			// duration: duration,
			notes: [{notes: notes}]
		});
	}
	else{
		for(var i=0; i<agenda.length; i++){
			if(agenda[i] != ''){
				var number= i+1;
				emailAgenda+=number+':  '+ agenda[i]+'<br/>';
				newMeeting.agenda.push({
					topic: agenda[i],
					// duration: duration[i]
					notes: [{notes: notes[i]}]
				});
			}
		};
	}

	if(typeof attendeeNames == 'string'){
		newMeeting.attendees.push({
			attendeeName: attendeeNames,
			attendeeEmail: attendeeEmails
		});
	}
	else{
		for(var i=0; i<attendeeNames.length; i++){
			if(attendeeNames[i] != ''){
				newMeeting.attendees.push({
					attendeeName: attendeeNames[i],
					attendeeEmail: attendeeEmails[i]
				});
			}
		};
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

	// //email function
	// smtpConfig = nodemailer.createTransport('SMTP', {
	// 	service: 'Gmail',
	// 	auth: {
	// 		user: "seammeetings@gmail.com",
	// 		pass: "123456789a!"
	// 	}
	// });
	// //construct the email sending module
	// mailBody = {
	// 	forceEmbeddedImages: true,
	// 	from: "SEAM Meetings <seammeetings@gmail.com>",
	// 	to: meetingMembers,
	// 	subject: '[ '+meetingDate+' ] '+ meetingTitle + ' Meeting Agenda',
	// 	text: 'Date: '+ meetingDate +'\n\n'+ 'Objectives: '+objective+'\n\n'+ 'Agenda: \n\n'+ emailAgenda,

	// 	// HTML body
 //    	html:"<body>"+
 //    	"<p style='text-align:center'><img src='cid:logo@seam'/></p>"+
 //        "<p style='text-align:left; text-transform:capitalize'> Date: "+meetingDate+"<br/></p>" +
 //        "<p style='text-align:left; text-transform:capitalize'> Duration: "+meetingTime+" Minutes <br/></p>" +
 //        "<p style='text-align:left; text-transform:capitalize'> Objectives: "+objective+"<br/></p>" +
 //        "<p style='text-align:left; text-transform:capitalize'> Agenda: <br/>"+emailAgenda+"<br/></p>"+
 //        "</body>",
	//     attachments:[
	//         // Logo img
	//         {
	//             filePath: './public/images/seamlogo-red125.png',
	//             cid: 'logo@seam' // should be as unique as possible
	//         },

	//     ]
	// };
	// //send Email
	// smtpConfig.sendMail(mailBody, function (error, response) {
	// 	//Email not sent
	// 	if (error) {
	// 		res.end("Email send Failed");
	// 	}
	// 	//email send sucessfully
	// 	else {
	// 		res.end("Email send sucessfully");
	// 	}
	// });

	res.redirect('/dashboard');
};