var mongoose = require('mongoose');
var Meeting = require('../models/meeting-model');
var Project = require('../models/project-model');
var nodemailer = require('nodemailer');

exports.makeMeeting = function(req, res){
	res.render('loggedIn/meetings/makeMeeting', { 
		title: 'SEAM',
		name: req.session.name,
		user : req.session.userId
	});
};

exports.editMeeting = function(req, res){
	var meetingId = req.body.meetingId;
	if(meetingId == undefined){
		meetingId = req.session.meetingId;
	}
	else{
		req.session.meetingId = meetingId;
	}
	console.log(meetingId);
	Meeting.findOne({'_id': meetingId}, function(e, doc){
		var duration = 0;
		if(doc.duration != '' && doc.duration != undefined){
			console.log(doc.duration);
			var sepDuration = doc.duration.split(',');
			for(var i = 0; i < sepDuration.length; i++){
				if(sepDuration[i] != ',')
				duration = parseInt(duration) + parseInt(sepDuration[i]);
			}
		}

		var meetingDate = '';

		if(doc.meetingDate != undefined && doc.meetingDate != ''){
			var date = doc.meetingDate;
			var duration = doc.meetingTime;
			console.log(duration);
			var year = date.getFullYear();
			var month = date.getMonth() + 1;
			var day = date.getDate();
			var startHour = date.getHours();
			var startMinutes = date.getMinutes();
			var meridiam = 'AM';
			if(startHour > 12){
				startHour = startHour%12;
				meridiam = 'PM'
			}
			if(startMinutes < 10){
				startMinutes = "0" + startMinutes;
			}
			var endDate = addMinutes(date, duration);
			var endHour = endDate.getHours();
			var endMinutes = endDate.getMinutes();
			if(endHour > 12){
				endHour = endHour%12;
			}
			if(endMinutes < 10){
				endMinutes = "0" + endMinutes;
			}				
			var timeString = month + "/" + day + "/" + year + " " + startHour + ":" + startMinutes + " " + meridiam;
			meetingDate = timeString;
			console.log(meetingDate);
		}

		res.render('loggedIn/meetings/editMeeting', { 
			title: 'SEAM',
			meeting: doc,
			meetingDate: meetingDate,
			meetingDuration: duration,
			name: req.session.name,
			user : req.user
		});
	})
};

exports.updateMeeting = function(req, res){
	var userId = req.session.userId;
	var meetingId = req.body.meetingId;
	var conditions = { _id: meetingId};
	var meetingTitle = req.body.meetingTitle;
	var objective = req.body.objective;
	var location = req.body.location;
	var agenda = req.body.agendaTopic;
	var duration = req.body.duration;
	var meetingDate = req.body.meetingDate;
	var meetingTime = req.body.meetingTime;  
	var attendeeNames = req.body.attendeeName;
	var attendeeEmails = req.body.attendeeEmail;
	var notes = req.body.notes;
	var emailAgenda='';
	var timerInfo= meetingTime+','+duration;

	console.log(meetingDate);

	if(meetingDate != ""){
		if(typeof parseInt(meetingDate[0]) == 'number'){
			var meetingMonthDate = meetingDate.split('/'); // for example: 03/25/2014 8:53 PM - splits to 03,25,2014 8:53 PM 
			var meetingYearTime = meetingMonthDate[2].split(' '); // - splits to 2014,8:53,PM
			var meetingHourMin = meetingYearTime[1].split(':'); // - splits to 8,53
			meetingDate = new Date(meetingYearTime[0], meetingMonthDate[0] - 1, meetingMonthDate[1], meetingHourMin[0], meetingHourMin[1]);
			console.log('The meeting time: ' + meetingDate);
		}
		else{
			meetingDate = '';
		}
	}

	var meetingData = {
		UserId: userId,
		meetingTitle: meetingTitle,
		objective: objective,
		location: location,
		meetingDate: meetingDate,
		duration: duration,
		agenda: new Array(),
		attendees: new Array(),
		// meetingStartTime:meetingStartTime,
		meetingTime: meetingTime,
		timerInfo: timerInfo
	};

	if(agenda != undefined){	
		if(typeof agenda == 'string'){
			emailAgenda+='1:  '+ agenda+'<br/>';
			meetingData.agenda.push({
				topic: agenda,
				duration: duration,
				notes: [{notes: notes}]
			});
		}
		else{
			for(var i=0; i<agenda.length; i++){
				if(agenda[i] != ''){
					var number= i+1;
					emailAgenda+=number+':  '+ agenda[i]+'<br/>';
					meetingData.agenda.push({
						topic: agenda[i],
						duration: duration[i],
						notes: [{notes: notes[i]}]
					});
				}
			};
		}
	}

	if(attendeeNames != undefined){	
		if(typeof attendeeNames == 'string'){
			meetingData.attendees.push({
				attendeeName: attendeeNames,
				attendeeEmail: attendeeEmails
			});
		}
		else{
			for(var i=0; i<attendeeNames.length; i++){
				if(attendeeNames[i] != ''){
					meetingData.attendees.push({
						attendeeName: attendeeNames[i],
						attendeeEmail: attendeeEmails[i]
					});
				}
			};
		}
	}

	var update = { $set: meetingData };
	var options = { upsert: true };	

	Meeting.update(conditions, update, options, function(){res.redirect('dashboard');});
}

exports.makeNewMeeting = function(req, res){
	res.render('loggedIn/meetings/makeMeeting', { 
		title: 'SEAM',
		name: req.session.name,
		user : req.session.userId
	});
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
	console.log("in post");
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

		var meetingDate = '';

		if(doc.meetingDate != undefined && doc.meetingDate != ''){

			var date = doc.meetingDate;
			var duration = doc.meetingTime;
			console.log(duration);
			var year = date.getFullYear();
			var month = date.getMonth() + 1;
			var day = date.getDate();
			var startHour = date.getHours();
			var startMinutes = date.getMinutes();
			if(startHour > 12){
				startHour = startHour%12;
			}
			if(startMinutes < 10){
				startMinutes = "0" + startMinutes;
			}
			var endDate = addMinutes(date, duration);
			var endHour = endDate.getHours();
			var endMinutes = endDate.getMinutes();
			if(endHour > 12){
				endHour = endHour%12;
			}
			if(endMinutes < 10){
				endMinutes = "0" + endMinutes;
			}				
			var timeString = month + "/" + day + "/" + year + " " + startHour + ":" + startMinutes + " - " + endHour + ":" + endMinutes; 
			meetingDate = timeString;
			console.log(meetingDate);
		}

		res.render('loggedIn/meetings/startMeeting', { 
			title: 'SEAM',
			name: req.session.name,
			meetingDate: meetingDate,
			meeting: doc,
			user : req.user,
			past : 0
		});
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

		var meetingDate = '';

		if(doc.meetingDate != undefined && doc.meetingDate != ''){

			var date = doc.meetingDate;
			var duration = doc.meetingTime;
			console.log(duration);
			var year = date.getFullYear();
			var month = date.getMonth() + 1;
			var day = date.getDate();
			var startHour = date.getHours();
			var startMinutes = date.getMinutes();
			if(startHour > 12){
				startHour = startHour%12;
			}
			if(startMinutes < 10){
				startMinutes = "0" + startMinutes;
			}
			var endDate = addMinutes(date, duration);
			var endHour = endDate.getHours();
			var endMinutes = endDate.getMinutes();
			if(endHour > 12){
				endHour = endHour%12;
			}
			if(endMinutes < 10){
				endMinutes = "0" + endMinutes;
			}				
			var timeString = month + "/" + day + "/" + year + " " + startHour + ":" + startMinutes + " - " + endHour + ":" + endMinutes; 
			meetingDate = timeString;
			console.log(meetingDate);
		}

		res.render('loggedIn/meetings/startMeeting', { 
			title: 'SEAM',
			meetingDate: meetingDate,
			meeting: doc,
			user : req.user,
			past : 0
		});
	})
};

exports.endMeeting = function(req, res){
	var meetingId = req.session.meetingId;
	var mailBody, smtpConfig;
	var emailAgenda='';
	var agenda,meetingTitle,meetingDate,objective,meetingAttendees,emailDate,emailTime,creatorEmail;
	var emailList='';
	// console.log(meetingId);
	Meeting.findByIdAndUpdate(meetingId, {
		'isComplete' : 1

	}, function(e, result){
		if(e) console.log(e);
		else console.log("Successfully finished meeting");
	});
	Meeting.find({'ProjectId': meetingId, 'UserId' : req.session.userId}, function(e, docs){
		Meeting.findOne({'_id': meetingId}, function(e, doc){
			agenda=doc.agenda;
			meetingTitle=doc.meetingTitle;
			objective=doc.objective;
			meetingAttendees=doc.attendees;
			meetingDate=doc.meetingDate;
			var creatorEmail= getCreatorEmail(req,doc.userId);

			console.log("EMAIL: "+creatorEmail);
			emailList=creatorEmail+',';
			var meetingYear = meetingDate.getFullYear(); 
			var meetingMonth = meetingDate.getMonth()+1; 
			var meetingDay = meetingDate.getDate(); 
			emailDate= meetingMonth +"/"+meetingDay+"/"+meetingYear ;
			emailTime=doc.meetingTime;
			if(typeof agenda == 'string'){
				emailAgenda+="<p style='text-align:left; text-transform:capitalize'> 1: "+agenda.topic+"<br/></p>";
			}
			else{
				for(var i=0; i<agenda.length; i++){
					if(agenda[i] != ''){
						var number= i+1;
						var notes= agenda[i].notes;
						emailAgenda+=number+':  '+ agenda[i].topic+'<br/>';
						var initialNoteCount= -1; //If there is initial note count =0
						if(notes.length>0 && notes[0].notes!='' ){
							emailAgenda+="<p style='margin-left:5em;'> A"+". "+notes[0].notes+"<br/></p>";
							initialNoteCount=0;
						}
						for(var z=1; z<notes.length;z++){
							emailAgenda+="<p style='margin-left:5em;'> " +String.fromCharCode(97 + z+ initialNoteCount)+". "+notes[z].notes+"<br/></p>";
						}
					}
				};
			}
			if(meetingAttendees!=''){
				for(var i=0; i<meetingAttendees.length; i++){
					emailList+=meetingAttendees[i].attendeeEmail+',';
				}
			}
			mailBody=createMinutesBody(emailDate,meetingTitle,emailList,objective,emailAgenda,emailTime,objective,emailAgenda);
			emailFunction(mailBody,res);

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
	Meeting.find({'ProjectId': req.session.projectId, 'UserId' : req.session.userId}, function(e, docs){
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
	Meeting.find({'UserId' : req.session.userId, 'isComplete' : 1}).sort({meetingDate: -1}).exec(function(e, meetingList){
		
		var meetingDate = new Array();

		for(var i = 0; i < meetingList.length; i++){
			if(meetingList[i].meetingDate != undefined){
				var date = meetingList[i].meetingDate;
				var duration = meetingList[i].meetingTime;
				var year = date.getFullYear();
				var month = date.getMonth() + 1;
				var day = date.getDate();
				var startHour = date.getHours();
				var startMinutes = date.getMinutes();
				if(startHour > 12){
					startHour = startHour%12;
				}
				if(startMinutes < 10){
					startMinutes = "0" + startMinutes;
				}
				var endDate = addMinutes(date, duration);
				var endHour = endDate.getHours();
				var endMinutes = endDate.getMinutes();
				if(endHour > 12){
					endHour = endHour%12;
				}
				if(endMinutes < 10){
					endMinutes = "0" + endMinutes;
				}				
				var timeString = month + "/" + day + "/" + year + " " + startHour + ":" + startMinutes + " - " + endHour + ":" + endMinutes; 
				meetingDate[i] = timeString;
				console.log(meetingDate[i]);
			}
		}

		res.render('loggedIn/meetings/pastMeeting', { 
			title: 'SEAM', 
			meetingDate: meetingDate,
			meetingList: meetingList,
			name: req.session.name,
			user : req.user
		});
	})
	/*
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
			res.render('loggedIn/meetings/pastMeeting', { 
				title: 'SEAM',
				taskList: task,
				meeting: doc,
				projectName: req.session.projectName,
				user : req.user,
				past : 1
			});
		})
	})*/
};

exports.addNote = function(req, res){
	var noteOrder = req.body.noteOrder;
	var meetingId = req.session.meetingId;
	var notes = req.body.notes;
	console.log(req.body);
	console.log(noteOrder + " " + meetingId + " " + notes);
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
				// Meeting.find({}, function(e, docs){console.log(docs);});
			}
		});	
		res.redirect('back');
	})
};

exports.addTask = function(req, res){

	var taskOrder = req.body.noteOrder;
	var meetingId = req.session.meetingId;
	var task = req.body.taskName;
	var taskAssignee = req.body.taskAssignee;
	var taskDueDate = req.body.taskDueDate;
	console.log(req.body);
	console.log(taskOrder + " " + meetingId + " " + task);
	Meeting.findOne({'_id': meetingId}, function(e, doc){
		doc.agenda[taskOrder].tasks.push({ assigneeName: taskAssignee, task: task, taskDueDate: taskDueDate});
		doc.save(function(err, doc){
			if(err){
				console.log('Problem adding task to database')
				console.log(err);
				res.location('error');
				res.redirect('error', {user : req.user});
			}
			else{
				console.log('Added task successfully');
				// Meeting.find({}, function(e, docs){console.log(docs);});
			}
		});
		res.redirect('back');
	})
};

exports.addMeeting = function(req, res){
	var mailBody, smtpConfig;
	var userId = req.session.userId;
	var meetingTitle = req.body.meetingTitle;
	var objective = req.body.objective;
	var location = req.body.location;
	var agenda = req.body.agendaTopic;
	var duration = req.body.duration;
	var meetingDate = req.body.meetingDate;
	var meetingTime = req.body.meetingTime;  
	var attendeeNames = req.body.attendeeName;
	var attendeeEmails = req.body.attendeeEmail;
	var notes = req.body.notes;
	var emailAgenda='';
	var emailDate='';
	var timerInfo= meetingTime+','+duration;
	var icalEmail=[];
	var creatorEmail= getCreatorEmail(req, userId);
	var emailList=creatorEmail+',';
	console.log("duration"+duration+"meetingTime"+meetingTime);
	icalEmail.push({name:"Creator", email:creatorEmail});
	var meetingStartTime,meetingEndTime,meetingEndTime,icalDate,icalStartTime,icalEndTime='';

	if(meetingDate != ""){
		if(typeof parseInt(meetingDate[0]) == 'number'){
			var meetingMonthDate = meetingDate.split('/'); // for example: 03/25/2014 8:53 PM - splits to 03,25,2014 8:53 PM 
			var meetingYearTime = meetingMonthDate[2].split(' '); // - splits to 2014,8:53,PM
			var meetingHourMin = meetingYearTime[1].split(':'); // - splits to 8,53
			var hour=parseInt(meetingHourMin[0]);
			if(meetingYearTime[2]=="PM"){
				console.log("PM");
				hour+=12;
			}
			meetingStartTime = new Date(meetingYearTime[0], meetingMonthDate[0] - 1, meetingMonthDate[1], hour, meetingHourMin[1]);

			console.log("date: "+ meetingStartTime);
			meetingEndTime= new Date(meetingYearTime[0], meetingMonthDate[0] - 1, meetingMonthDate[1], hour, meetingHourMin[1]);
			var length=parseInt(meetingTime);
			meetingEndTime.setMinutes(meetingStartTime.getMinutes()+length);
			emailDate=parseInt(meetingStartTime.getMonth()+1)+"/"+meetingStartTime.getDate()+"/"+meetingStartTime.getFullYear();
			icalDate=meetingStartTime.getMonth()+""+meetingStartTime.getDate()+""+meetingStartTime.getFullYear();
			var icalStartTime=meetingStartTime.getFullYear()+"-"+('0' + meetingStartTime.getMonth()).slice(-2)+"-"+('0' + meetingStartTime.getDate()).slice(-2)+"T0"+ ('0' +meetingStartTime.getHours()).slice(-2)+":"+('0' + meetingStartTime.getMinutes()).slice(-2)+"-5:00";
			var icalEndTime=meetingEndTime.getFullYear()+"-"+('0' + meetingEndTime.getMonth()).slice(-2)+"-"+('0' + meetingEndTime.getDate()).slice(-2)+"T0"+ ('0' +meetingEndTime.getHours()).slice(-2)+":"+('0' + meetingEndTime.getMinutes()).slice(-2)+"-5:00";
			console.log("start"+icalStartTime);
		}
		else{
			meetingDate = '';
		}
	}

	var newMeeting = new Meeting({
		UserId: userId,
		meetingTitle: meetingTitle,
		objective: objective,
		location: location,
		meetingDate: meetingStartTime,
		duration: duration,
		meetingTime: meetingTime,
		timerInfo: timerInfo
	});

	if(agenda != undefined){	
		if(typeof agenda == 'string'){
			emailAgenda+='1:  '+ agenda+'<br/>'+"<p style='margin-left:5em;'> "+notes+"<br/></p>";
			newMeeting.agenda.push({
				topic: agenda,
				duration: duration,
				notes: [{notes: notes}]
			});
		}
		else{
			for(var i=0; i<agenda.length; i++){
				if(agenda[i] != ''){
					var number= i+1;
					emailAgenda+=number+':  '+ agenda[i]+'<br/>'+"<p style='margin-left:5em;'> "+notes[i]+"<br/></p>";
					newMeeting.agenda.push({
						topic: agenda[i],
						duration: duration[i],
						notes: [{notes: notes[i]}]
					});
				}
			};
		}
	}

	if(attendeeNames != undefined){	
		if(typeof attendeeNames == 'string'){
			emailList+=attendeeEmails;
			icalEmail.push({name:attendeeNames, email:attendeeEmails});
			newMeeting.attendees.push({
				attendeeName: attendeeNames,
				attendeeEmail: attendeeEmails
			});
		}
		else{
			for(var i=0; i<attendeeNames.length; i++){
				if(attendeeNames[i] != ''){
					emailList+=attendeeEmails[i]+',';
					icalEmail.push({name:attendeeNames[i], email:attendeeEmails[i]});
					newMeeting.attendees.push({
						attendeeName: attendeeNames[i],
						attendeeEmail: attendeeEmails[i]
					});
				}
			};
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
			// Meeting.find({}, function(e, docs){console.log(docs);});
		}
	});

	//Create ical File
	var icsFilePath=createiCal(creatorEmail,meetingTitle,icalDate,icalEmail,meetingDate,meetingEndTime,objective,location);
	mailBody=createAgendaBody(emailList,emailDate,meetingTitle,objective,emailAgenda,location,meetingTime,icsFilePath);
	emailFunction(mailBody,res,icsFilePath);

	res.redirect('/dashboard');
};

function addMinutes(date, minutes){
	return new Date(date.getTime() + minutes*60000);
}

function emailFunction(emailBody,res,icsFilePath){
	var smptpConfig;
	//email function
	smtpConfig = nodemailer.createTransport('SMTP', {
	service: 'Gmail',
	auth: {
		user: "seammeetings@gmail.com",
	 	pass: "123456789a!"
	}
	 });

	//send Email
	 smtpConfig.sendMail(emailBody, function (error, response) {
	//Email not sent
 	if (error) {
		res.end("Email Failed");
 	}
 	//email send sucessfully
	else {
		res.end("Email Successfully");
		if(icsFilePath==''){
			deleteFile(icsFilePath);
		}
		else{
		}
 	}

 });
}
function createAgendaBody(emailList,emailDate,meetingTitle,objective,emailAgenda,location,meetingTime,icsFilePath){
	var mailBody;
	console.log(emailList+' '+emailDate+' '+meetingTitle+' '+objective+' '+emailAgenda+' '+location+' '+meetingTime+' '+icsFilePath);
	//construct the email sending module
	mailBody = {
	 	forceEmbeddedImages: true,
	 	from: "SEAM Meetings <seammeetings@gmail.com>",
		to: emailList,
	 	subject: '[ '+emailDate+' ] '+ meetingTitle + ' Meeting Agenda',
	 	text: 'Date: '+ emailDate +'\n\n'+ 'Objectives: '+objective+'\n\n'+ 'Agenda: \n\n'+ emailAgenda,

	// HTML body
     	html:"<body>"+
     	"<p style='text-align:center'><img src='cid:logo@seam'/></p>"+
        "<p style='text-align:left;'> Date: "+emailDate+"<br/></p>" +
        "<p style='text-align:left;'> Location: "+location+"<br/></p>" +
        "<p style='text-align:left;'> Duration: "+meetingTime+" Minutes <br/></p>" +
        "<p style='text-align:left;'> Objectives: "+objective+"<br/></p>" +
        "<p style='text-align:left;'> Agenda: <br/>"+emailAgenda+"<br/></p>"+ 
        "</body>",
        attachments:[
         // Logo img
	        {
             filePath: './public/images/seamlogo-red125.png',
             cid: 'logo@seam' // should be as unique as possible
         },
        {
        	filePath: icsFilePath,
        	cid: 'ics@meet'

        },
    ]
 };
 return mailBody;
}
function createMinutesBody(emailDate,meetingTitle,emailList,objective,emailAgenda,emailTime,objective,emailAgenda){
	var mailBody;
	//construct the email sending module
			mailBody = {
			 	forceEmbeddedImages: true,
			 	from: "SEAM Meetings <seammeetings@gmail.com>",
				to: emailList,
			 	subject: '[ '+emailDate+' ] '+ meetingTitle + ' Meeting Minutes',
			 	text: 'Date: '+ emailDate +'\n\n'+ 'Objectives: '+objective+'\n\n'+ 'Agenda: \n\n'+ emailAgenda,

			// HTML body
		     	html:"<body>"+
		     	"<p style='text-align:center'><img src='cid:logo@seam'/></p>"+
		        "<p style='text-align:left;'> Duration: "+emailTime+" Minutes<br/></p>" +
		        "<p style='text-align:left;'> Objectives: "+objective+"<br/></p>" +
		        "<p style='text-align:left;'> Agenda: <br/>"+emailAgenda+"<br/></p>"+ 
		        "</body>",
		        attachments:[
		         // Logo img
			        {
		             filePath: './public/images/seamlogo-red125.png',
		             cid: 'logo@seam' // should be as unique as possible
		         }
		    	]
		 	};
	return mailBody;
}
//Creates ics File and returns File Name
function createiCal(userId,meetingTitle,icalDate,icalEmail,icalSTime,icalETime,objective,location){
	//ical Module
	var iCalEvent = require('icalevent');
	var tempFileName='icsFiles/'+userId+meetingTitle+icalDate+'.ics';
	var fs= require('fs');
	console.log(userId+","+meetingTitle+","+icalDate+","+icalEmail+","+icalSTime+","+icalETime+","+objective+","+location);
	//Create Event
	var events = new iCalEvent({
	    offset: new Date().getTimezoneOffset(),
	    method: 'request',
	    status: 'confirmed',
	    attendees: icalEmail,
	    start: icalSTime,
	    end: icalETime,
	    summary: meetingTitle+' Meeting',
	    description: objective,
	    location: location,
	    organizer: {
	    	name: "Creator",
	        email: userId
	    },
	});

	//Write to ics File 
	fs.writeFile(tempFileName, events.toFile(), function (err) {
	  if (err) return console.log(err);
	  console.log('File Created');
	});

	return tempFileName;
}
function deleteFile(fileName){
	//Deletes File
	var fs= require('fs');
	fs.unlink(fileName, function (err) {
	  	if (err) throw err;
	  		console.log('successfully deleted file');
	});
}

//Function that returns email if it is Google Login and email if local
function getCreatorEmail(req,userId){

	if(req.session.email==undefined){
		return userId;
	}else{
		return req.session.email;
	}
}