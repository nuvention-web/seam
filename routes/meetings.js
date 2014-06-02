var mongoose = require('mongoose');
var Meeting = require('../models/meeting-model');
var Rating = require('../models/rating-model');
var Contact = require('../models/contact-model');
var nodemailer = require('nodemailer');

exports.addSurvey = function(req, res){
	console.log(req.body);
	var meetingId = req.body.meetingId;
	var userId = req.body.userId;
	var name = req.body.name;
	var rating = req.body.rating;
	var ratings = {
		userId: userId,
		name: name,
		rating: rating
	}
	Rating.findOne({'meetingId': meetingId}, function(e, doc){
		console.log('this is the doc: ' + doc);
		res.send('success');
		if(doc){
			doc.ratings.push(ratings);
			doc.save(function(err, doc){
				if(err){
					console.log('Problem adding rating to database')
					console.log(err);
					res.send('failed to save note');
				}
				else{
					console.log('Added rating successfully');
					res.send('success');
				}
			});	
		}
		else{
			var newRating = new Rating({
				meetingId: meetingId,
				ratings: [ratings]
			});

			newRating.save(function(err, doc){
				if(err){
					console.log('Problem adding rating')
					res.send('fail');
				}
				else{
					console.log('Added new rating successfully');
					res.send('success');
				}
			});
		}
	});
}

exports.makeMeeting = function(req, res){
	Contact.findOne({'UserId':req.session.email}, function(e, doc){
		if(doc){
			console.log('worked');
			console.log(doc);
			res.render('loggedIn/meetings/makeMeeting', { 
				title: 'SEAM',
				name: req.session.name,
				contact: doc,
				email: req.session.email,
				user : req.session.userId,
				meeting: '',
				meetingDate: '',
				meetingDuration: '',
				isEdit : false,
				action: '/dashboard/meetings/makeMeeting/add'
			});
		}
		else{
			console.log("tried");
			res.render('loggedIn/meetings/makeMeeting', { 
				title: 'SEAM',
				name: req.session.name,
				contact:doc,
				email: req.session.email,
				user : req.session.userId,
				meeting: '',
				meetingDate: '',
				meetingDuration: '',
				isEdit : false,
				action: '/dashboard/meetings/makeMeeting/add'
			});
		}

	})
	
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

		res.render('loggedIn/meetings/makeMeeting', { 
			title: 'SEAM',
			meeting: doc,
			meetingDate: meetingDate,
			meetingDuration: duration,
			name: req.session.name,
			email: req.session.email,
			user : req.session.userId,
			isEdit : true,
			action : '/dashboard/meetings/edit/update'
		});
	})
};

exports.updateMeeting = function(req, res){
	var userId = req.session.userId;
	var creatorEmail = req.session.email;
	var creatorName = req.session.creatorName;
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
				notes: [{notes: notes}],
				timeLeft: 0
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
						notes: [{notes: notes[i]}],
						timeLeft: 0
					});
				}
			};
		}
	}

	if(attendeeNames != undefined){	
		if(typeof attendeeNames == 'string'){
			meetingData.attendees.push({
				attendeeName: attendeeNames,
				attendeeEmail: attendeeEmails.toLowerCase()
			});
		}
		else{
			for(var i=0; i<attendeeNames.length; i++){
				if(attendeeNames[i] != ''){
					meetingData.attendees.push({
						attendeeName: attendeeNames[i],
						attendeeEmail: attendeeEmails[i].toLowerCase()
					});
				}
			};
		}
	}
	
	var update = { $set: meetingData };
	var options = { upsert: true };	

	Meeting.update(conditions, update, options, function(){res.redirect('dashboard');});
}

exports.viewMeeting = function(req, res){
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
		res.render('loggedIn/meetings/viewMeeting', { 
			title: 'SEAM',
			meeting: doc,
			name: req.session.name,
			meetingList: docs,
			user : req.user,
			past : 0
		});
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
		// console.log(doc);

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
			user : req.session.userId,
			name : req.session.name,
			past : 0,
			isAttendee : false
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
		// console.log(doc);

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
			user : req.session.userId,
			name : req.session.name,
			past : 0,
			isAttendee : false
		});
	})
};

exports.endMeeting = function(req, res){
	var meetingId = req.body.meetingId;
	var mailBody, smtpConfig;
	var emailAgenda='';
	var emailTask='';
	var agenda,meetingTitle,meetingDate,objective,meetingAttendees,emailDate,emailTime,creatorEmail;
	var emailList='';
	// console.log(meetingId);
	Meeting.findByIdAndUpdate(meetingId, {
		'isComplete' : 1

	}, function(e, result){
		if(e) console.log(e);
		else console.log("Successfully finished meeting");
	});

	Meeting.findOne({'_id': meetingId}, function(e, doc){
		agenda=doc.agenda;
		meetingTitle=doc.meetingTitle;
		objective=doc.objective;
		meetingAttendees=doc.attendees;
		meetingDate=doc.meetingDate;
		var creatorEmail= req.session.userId;

		console.log("EMAIL creator: "+creatorEmail);
		emailList=creatorEmail+',';
		var meetingYear = meetingDate.getFullYear(); 
		var meetingMonth = meetingDate.getMonth()+1; 
		var meetingDay = meetingDate.getDate(); 
		emailDate= meetingMonth +"/"+meetingDay+"/"+meetingYear ;
		emailTime=doc.meetingTime;
		var taskLists= getTaskList(doc);
		if(typeof agenda == 'string'){
			emailAgenda+="<p style='text-align:left; text-transform:capitalize'> 1: "+agenda.topic+"<br/></p>";
		}
		else{
			for(var i=0; i<agenda.length; i++){
				if(agenda[i] != ''){
					var number= i+1;
					var notes= agenda[i].notes;
					var tasks= agenda[i].tasks;
					emailAgenda+=number+':  '+ agenda[i].topic+'<br/>';
					var initialNoteCount= -1; //If there is initial note count =0
					if(notes.length>0 && notes[0].notes!='' ){
						emailAgenda+="<p style='margin-left:5em;'> a"+". "+notes[0].notes+"<br/></p>";
						initialNoteCount=0;
					}
					if(tasks.length>0 && tasks[0].task!='' ){
						emailTask+="<p style=''>"+tasks[0].assigneeName+": "+tasks[0].task+" (Due: "+tasks[0].taskDueDate+")<br/></p>";
					}
					for(var z=1; z<notes.length;z++){
						emailAgenda+="<p style='margin-left:5em;'> " +String.fromCharCode(97 + z+ initialNoteCount)+". "+notes[z].notes+"<br/></p>";
					}
					for(var z=1; z<tasks.length;z++){
						emailTask+="<p style=''>"+tasks[z].assigneeName+": "+tasks[z].task+" (Due: "+tasks[z].taskDueDate+")<br/></p>";
					}
				}
			};
		}
		console.log("EMAIL: "+ emailTask);
		if(meetingAttendees!=''){
			for(var i=0; i<meetingAttendees.length; i++){
				emailList+=meetingAttendees[i].attendeeEmail+',';
			}
		}
		mailBody=createMinutesBody(creatorEmail,emailDate,meetingTitle,emailList,objective,emailAgenda,emailTask,emailTime,objective,emailAgenda,taskLists);
		emailFunction(mailBody,res);
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
	Meeting.findOne({'_id': meetingId}, function(e, doc){
		//console.log(doc);

		res.render('loggedIn/meetings/viewMeeting', { 
			title: 'SEAM',
			meeting: doc,
			user : req.user,
			past : 1
		});
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
				res.send('failed to save note');
			}
			else{
				var notesLength = doc.agenda[noteOrder].notes.length - 1;
				var noteId = doc.agenda[noteOrder].notes[notesLength]._id;
				console.log('Added notes successfully');
				res.send(noteId);
				// Meeting.find({}, function(e, docs){console.log(docs);});
			}
		});	
	});
};

exports.editNote = function(req, res){
	console.log('this is the req: ' + req);
	var noteId = req.body.noteId;
	var newNote = req.body.noteData;
	var conditions = { _id: noteId};
	var noteData = {notes: newNote};
	var update = { $set: noteData };
	var options = { upsert: true };	

	Meeting.update(conditions, update, options, function(){res.send('update successful');});
}

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
				res.send('failed to save task');
			}
			else{
				var tasksLength = doc.agenda[taskOrder].tasks.length - 1;
				var taskId = doc.agenda[taskOrder].tasks[tasksLength]._id;
				console.log('Added task successfully');
				res.send(taskId);
				// Meeting.find({}, function(e, docs){console.log(docs);});
			}
		});
	});
};

exports.addMeeting = function(req, res){
	var mailBody, smtpConfig;
	var userId = req.session.userId;
	var creatorName = req.session.name;
	var creatorEmail = req.session.email;
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
		timerInfo: timerInfo,
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
	//Contact Person Array -- Array of contacts added to the meeting
	var contactPerson=[];

	if(attendeeNames != undefined){	
		if(typeof attendeeNames == 'string'){
			emailList+=attendeeEmails;
			icalEmail.push({name:attendeeNames, email:attendeeEmails});
			newMeeting.attendees.push({
				attendeeName: attendeeNames,
				attendeeEmail: attendeeEmails.toLowerCase()
			});
			//Add to array if the email is not the creator
			if(attendeeEmails.toLowerCase()!=req.session.email){
				contactPerson.push({
					memberName: attendeeNames,
					memberEmail: attendeeEmails.toLowerCase()
				});
			}
		}
		else{
			for(var i=0; i<attendeeNames.length; i++){

				if(attendeeNames[i] != '' && attendeeEmails[i] != undefined){
					emailList+=attendeeEmails[i]+',';
					icalEmail.push({name:attendeeNames[i], email:attendeeEmails[i]});
					newMeeting.attendees.push({
						attendeeName: attendeeNames[i],
						attendeeEmail: attendeeEmails[i].toLowerCase()
					});
					//Add to temp array. Ignore email if it is creator
					if(attendeeEmails[i].toLowerCase()!=req.session.email){
						contactPerson.push({
							memberName: attendeeNames[i],
							memberEmail: attendeeEmails[i].toLowerCase()
						});
					}
				}
			};
		}
	}

	//Add to contact
	Contact.findOne({'UserId': req.session.email}, function(e, doc){
		res.send('success');
		if(doc){
			for(var i=0; i<contactPerson.length; i++){
				//Look for existing email in group-- don't add if exist
				var z=0;
				var foundExisting=true;
				while(foundExisting && z<doc.contacts.length){
					 if(doc.contacts[z].memberEmail == contactPerson[i].memberEmail) {
				     console.log("FOUND EXISTING EMAIL!");
				     foundExisting=false;
				   }
				   z++;
				}
				//Push to contact if new email
				if(foundExisting){
					doc.contacts.push(contactPerson[i]);
					console.log("Pushed new email");
				}
			}
			doc.save(function(err, doc){
				if(err){
					console.log('Problem adding contact to database')
					console.log(err);
					res.send('failed to save contact');
				}
				else{
					console.log('Added contact successfully');
					res.send('success');
				}
			});	
			

		}
		else{
			//First Time Use
			var newContact = new Contact({
				UserId: req.session.email,
				contacts: contactPerson
			});
			newContact.save(function(err, doc){
				if(err){
					console.log('Problem adding contact')
					res.send('fail');
					console.log(doc);
				}
				else{
					console.log('Added new contact successfully');
					res.send('success');
					console.log(doc);
				}
			});
		}
	});




	newMeeting.save(function(err, doc){
		if(err){
			console.log('Problem adding information to database')
			console.log(err);
			res.location('error');
			res.redirect('error', {user : req.user});
		}
		else{
			var meetingID=doc._id;
			//Create ical File
			var icsFilePath=createiCal(creatorEmail,meetingTitle,icalDate,icalEmail,meetingDate,meetingEndTime,objective,location,meetingID);
			mailBody=createAgendaBody(creatorEmail,emailList,emailDate,meetingTitle,objective,emailAgenda,location,meetingTime,icsFilePath);
			emailFunction(mailBody,res,icsFilePath);
			console.log('Added new meeting successfully');
			// Meeting.find({}, function(e, docs){console.log(docs);});
		}
	});
	

	res.redirect('/dashboard');
};

exports.postJoinMeeting = function(req, res){
	
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
			user : req.session.userId,
			name : req.session.name,
			past : 0,
			isAttendee : true
		});
	})	
}

exports.getJoinMeeting = function(req, res){
	
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
			user : req.session.userId,
			name : req.session.name,
			past : 0,
			isAttendee : true
		});
	})	
}

exports.updateTimer = function(req, res){
	
	console.log(req.body);
	var meetingId = req.body.meetingId;
	var conditions = { _id: meetingId};
	var value = req.body.value;
	var timeLeft = req.body.timeExpired;
	console.log(timeLeft);

	Meeting.findOne({"_id": meetingId}, function(err, meeting){
		meeting.agenda[value].timeLeft = timeLeft;
		meeting.save(function(err){
			if(err){
				console.log('Problem adding information to database')
				console.log(err);
				res.send('failed to update time');
			}
			else{
				console.log('Updated time successfully');
				res.send('success');
			}
		});
	});
}


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
		if(icsFilePath=='' || icsFilePath==undefined){
			//deleteFile(icsFilePath);
		}
		else{
			console.log('../'+icsFilePath);
			deleteFile(icsFilePath);
		}
 	}

 });
}
function createAgendaBody(emailCreator,emailList,emailDate,meetingTitle,objective,emailAgenda,location,meetingTime,icsFilePath){
	var mailBody;
	console.log(emailList+' '+emailDate+' '+meetingTitle+' '+objective+' '+emailAgenda+' '+location+' '+meetingTime+' '+icsFilePath);
	var htmlEmail=emailHTMLCSS();
	//construct the email sending module
	mailBody = {
	 	forceEmbeddedImages: true,
	 	from: "SEAM Meetings <seammeetings@gmail.com>",
		to: emailList,
	 	subject: '[ '+emailDate+' ] '+ meetingTitle + ' Meeting Agenda',
	 	text: 'Date: '+ emailDate +'\n\n'+ 'Objectives: '+objective+'\n\n'+ 'Agenda: \n\n'+ emailAgenda,

	// HTML body
     	html:"<body>"+
     	"<p style='text-align:center; margin:0 auto;  width:50px; height:50px;'><img src='cid:logo@seam'/></p>"+     	
        "<p style='text-align:left;'> Creator: "+emailCreator+"<br/></p>" +
        "<p style='text-align:left;'> Date: "+emailDate+"<br/></p>" +
        "<p style='text-align:left;'> Location: "+location+"<br/></p>" +
        "<p style='text-align:left;'> Duration: "+meetingTime+" Minutes <br/></p>" +
        "<p style='text-align:left;'> Objectives: "+objective+"<br/></p>" +
        "<p style='text-align:left;'> Agenda: <br/>"+emailAgenda+"<br/></p>"+ 
        "<table border='0' cellpadding='0' cellspacing='0' style='background-color:#505050; border:1px solid #353535; border-radius:5px;'>"+
    	"<tr>"+
        "<td align='center' valign='middle' style='color:#FFFFFF; font-family:Helvetica, Arial, sans-serif; font-size:16px; font-weight:bold; letter-spacing:-.5px; line-height:150%; padding-top:15px; padding-right:30px; padding-bottom:15px; padding-left:30px;'>"+
            "<a href='http://www.getseam.co/login/?utm_source=email&utm_medium=email&utm_campaign=agenda' target='_blank' style='color:#FFFFFF; text-decoration:none;'>Login to SEAM</a></td></tr></table>"+
        "</body>",
        attachments:[
         // Logo img
	        {
             filePath: './public/images/favicon-64.png',
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
function createMinutesBody(emailCreator,emailDate,meetingTitle,emailList,objective,emailAgenda,emailTask,emailTime,objective,emailAgenda,taskLists){
	var mailBody;
	var htmlEmail=emailHTMLCSS();
	htmlEmail+="<body leftmargin='0' marginwidth='0' topmargin='0' marginheight='0' offset='0'> <center> <table border='0' cellpadding='0' cellspacing='0' height='100%' width='100%' id='backgroundTable'> <tr> <td align='center' valign='top'> <!-- // Begin Template Preheader \\ --> <!-- // End Template Preheader \\ --> <table border='0' cellpadding='0' cellspacing='0' width='600' id='templateContainer'> <tr> <td align='center' valign='top'> <!-- // Begin Template Header \\ -->  <!-- // End Template Header \\ --> </td> </tr> <tr> <td align='center' valign='top'> <!-- // Begin Template Body \\ --> <table border='0' cellpadding='0' cellspacing='0' width='600' id='templateBody'> <tr> <td valign='top' class='bodyContent'> <!-- // Begin Module: Standard Content \\ --> <table border='0' cellpadding='20' cellspacing='0' width='100%'> <tr> <td valign='top'> <div mc:edit='std_content00'> <div class='mtg-title-box'> <h1 class='h1 text-center'>"+meetingTitle+" Minutes</h1> </div>";
	htmlEmail+="<h3 style='text-align:left;'> Objectives: "+objective+"</h3>" ;
	htmlEmail+="<h3 class='h3'>Tasks</h3><table>";
	for (var taskAssignee in taskLists) {
		if (taskLists.hasOwnProperty(taskAssignee)) {

			tasks = taskLists[taskAssignee];
			for (var i = 0; i < tasks.length; i++){
				htmlEmail+="<tr>"+taskAssignee+" <td>"+tasks[i].task+"("+tasks[i].dueDate+")</td></tr>";   
			}
		}
	}
	htmlEmail+="</table>";
	htmlEmail+="<h3 class='h3' style='text-align:left;'> Agenda: </h3>"+
		        "<p style='text-align:left;'>"+emailAgenda+"<br/></p>"+
		        "<p style='text-align:left;'> Please send us any feedback you have <a href='http://www.getseam.co/contact' target='_blank'>here</a>.</p>"+
		        "<a href='http://www.getseam.co/login' target='_blank'><img src='http://www.miketychen.com/images/SEAMBANNER.jpg' style='max-width:100px; text-align:right; float:right' id='headerImage campaign-icon' mc:label='header_image' mc:edit='header_image' mc:allowdesigner mc:allowtext /></a> </center></body> </html>";
	//construct the email sending module
			mailBody = {
			 	forceEmbeddedImages: true,
			 	from: "SEAM Meetings <seammeetings@gmail.com>",
				to: emailList,
			 	subject: '[ '+emailDate+' ] '+ meetingTitle + ' Meeting Minutes',
			 	text: 'Date: '+ emailDate +'\n\n'+ 'Objectives: '+objective+'\n\n'+ 'Agenda: \n\n'+ emailAgenda,

			// HTML body
		     	html:htmlEmail,
		        attachments:[
		         // Logo img
			        {
		             cid: 'logo@seam' // should be as unique as possible
		         }
		    	]
		 	};
	return mailBody;
}
function emailHTMLCSS(){
	var head="<!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.0 Transitional//EN' 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd'> <html> <head> <meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /> <title>*|MC:SUBJECT|*</title> <style type='text/css'> /* Client-specific Styles */ #outlook a{padding:0;} /* Force Outlook to provide a 'view in browser' button. */ body{width:100% !important;} .ReadMsgBody{width:100%;} .ExternalClass{width:100%;} /* Force Hotmail to display emails at full width */ body{-webkit-text-size-adjust:none;} /* Prevent Webkit platforms from changing default text sizes. */ /* Reset Styles */ body{margin:0; padding:0;} img{border:0; height:auto; line-height:100%; outline:none; text-decoration:none;} table td{border-collapse:collapse;} #backgroundTable{height:100% !important; margin:0; padding:0; width:100% !important;} /* Template Styles */ /* /\/\/\/\/\/\/\/\/\/\ STANDARD STYLING: COMMON PAGE ELEMENTS /\/\/\/\/\/\/\/\/\/\ */ /** * @tab Page * @section background color * @tip Set the background color for your email. You may want to choose one that matches your company's branding. * @theme page */ body, #backgroundTable{ /*@editable*/ background-color:#FAFAFA; } /** * @tab Page * @section email border * @tip Set the border for your email. */ #templateContainer{ /*@editable*/ border:0; } /** * @tab Page * @section heading 1 * @tip Set the styling for all first-level headings in your emails. These should be the largest of your headings. * @style heading 1 */ h1, .h1{ /*@editable*/ color:#202020; display:block; /*@editable*/ font-family:Arial; /*@editable*/ font-size:40px; /*@editable*/ font-weight:bold; /*@editable*/ line-height:100%; margin-top:2%; margin-right:0; margin-bottom:1%; margin-left:0; /*@editable*/ text-align:left; } /** * @tab Page * @section heading 2 * @tip Set the styling for all second-level headings in your emails. * @style heading 2 */ h2, .h2{ /*@editable*/ color:#404040; display:block; /*@editable*/ font-family:Arial; /*@editable*/ font-size:18px; /*@editable*/ font-weight:bold; /*@editable*/ line-height:100%; margin-top:2%; margin-right:0; margin-bottom:1%; margin-left:0; /*@editable*/ text-align:left; } /** * @tab Page * @section heading 3 * @tip Set the styling for all third-level headings in your emails. * @style heading 3 */ h3, .h3{ /*@editable*/ color:#606060; display:block; /*@editable*/ font-family:Arial; /*@editable*/ font-size:16px; /*@editable*/ font-weight:bold; /*@editable*/ line-height:100%; margin-top:2%; margin-right:0; margin-bottom:1%; margin-left:0; /*@editable*/ text-align:left; } /** * @tab Page * @section heading 4 * @tip Set the styling for all fourth-level headings in your emails. These should be the smallest of your headings. * @style heading 4 */ h4, .h4{ /*@editable*/ color:#808080; display:block; /*@editable*/ font-family:Arial; /*@editable*/ font-size:14px; /*@editable*/ font-weight:bold; /*@editable*/ line-height:100%; margin-top:2%; margin-right:0; margin-bottom:1%; margin-left:0; /*@editable*/ text-align:left; } /* /\/\/\/\/\/\/\/\/\/\ STANDARD STYLING: PREHEADER /\/\/\/\/\/\/\/\/\/\ */ /** * @tab Header * @section preheader style * @tip Set the background color for your email's preheader area. * @theme page */ #templatePreheader{ /*@editable*/ background-color:#FAFAFA; } /** * @tab Header * @section preheader text * @tip Set the styling for your email's preheader text. Choose a size and color that is easy to read. */ .preheaderContent div{ /*@editable*/ color:#707070; /*@editable*/ font-family:Arial; /*@editable*/ font-size:10px; /*@editable*/ line-height:100%; /*@editable*/ text-align:left; } /** * @tab Header * @section preheader link * @tip Set the styling for your email's preheader links. Choose a color that helps them stand out from your text. */ .preheaderContent div a:link, .preheaderContent div a:visited, /* Yahoo! Mail Override */ .preheaderContent div a .yshortcuts /* Yahoo! Mail Override */{ /*@editable*/ color:#336699; /*@editable*/ font-weight:normal; /*@editable*/ text-decoration:underline; } /** * @tab Header * @section social bar style * @tip Set the background color and border for your email's footer social bar. */ #social div{ /*@editable*/ text-align:right; } /* /\/\/\/\/\/\/\/\/\/\ STANDARD STYLING: HEADER /\/\/\/\/\/\/\/\/\/\ */ /** * @tab Header * @section header style * @tip Set the background color and border for your email's header area. * @theme header */ #templateHeader{ /*@editable*/ background-color:#FFFFFF; /*@editable*/ border-bottom:5px solid #505050; } /** * @tab Header * @section left header text * @tip Set the styling for your email's header text. Choose a size and color that is easy to read. */ .leftHeaderContent div{ /*@editable*/ color:#202020; /*@editable*/ font-family:Arial; /*@editable*/ font-size:32px; /*@editable*/ font-weight:bold; /*@editable*/ line-height:100%; /*@editable*/ text-align:right; /*@editable*/ vertical-align:middle; } /** * @tab Header * @section right header text * @tip Set the styling for your email's header text. Choose a size and color that is easy to read. */ .rightHeaderContent div{ /*@editable*/ color:#202020; /*@editable*/ font-family:Arial; /*@editable*/ font-size:32px; /*@editable*/ font-weight:bold; /*@editable*/ line-height:100%; /*@editable*/ text-align:left; /*@editable*/ vertical-align:middle; } /** * @tab Header * @section header link * @tip Set the styling for your email's header links. Choose a color that helps them stand out from your text. */ .leftHeaderContent div a:link, .leftHeaderContent div a:visited, .rightHeaderContent div a:link, .rightHeaderContent div a:visited{ /*@editable*/ color:#336699; /*@editable*/ font-weight:normal; /*@editable*/ text-decoration:underline; } #headerImage{ height:auto; max-width:180px !important; } /* /\/\/\/\/\/\/\/\/\/\ STANDARD STYLING: MAIN BODY /\/\/\/\/\/\/\/\/\/\ */ /** * @tab Body * @section body style * @tip Set the background color for your email's body area. */ #templateContainer, .bodyContent{ /*@editable*/ background-color:#FDFDFD; } /** * @tab Body * @section body text * @tip Set the styling for your email's main content text. Choose a size and color that is easy to read. * @theme main */ .bodyContent div{ /*@editable*/ color:#505050; /*@editable*/ font-family:Arial; /*@editable*/ font-size:14px; /*@editable*/ line-height:150%; /*@editable*/ text-align:left; } /** * @tab Body * @section body link * @tip Set the styling for your email's main content links. Choose a color that helps them stand out from your text. */ .bodyContent div a:link, .bodyContent div a:visited, /* Yahoo! Mail Override */ .bodyContent div a .yshortcuts /* Yahoo! Mail Override */{ /*@editable*/ color:#336699; /*@editable*/ font-weight:normal; /*@editable*/ text-decoration:underline; } .bodyContent img{ display:inline; height:auto; } /* /\/\/\/\/\/\/\/\/\/\ STANDARD STYLING: FOOTER /\/\/\/\/\/\/\/\/\/\ */ /** * @tab Footer * @section footer style * @tip Set the background color and top border for your email's footer area. * @theme footer */ #templateFooter{ /*@editable*/ background-color:#FAFAFA; /*@editable*/ border-top:3px solid #909090; } /** * @tab Footer * @section footer text * @tip Set the styling for your email's footer text. Choose a size and color that is easy to read. * @theme footer */ .footerContent div{ /*@editable*/ color:#707070; /*@editable*/ font-family:Arial; /*@editable*/ font-size:11px; /*@editable*/ line-height:125%; /*@editable*/ text-align:left; } /** * @tab Footer * @section footer link * @tip Set the styling for your email's footer links. Choose a color that helps them stand out from your text. */ .footerContent div a:link, .footerContent div a:visited, /* Yahoo! Mail Override */ .footerContent div a .yshortcuts /* Yahoo! Mail Override */{ /*@editable*/ color:#336699; /*@editable*/ font-weight:normal; /*@editable*/ text-decoration:underline; } .footerContent img{ display:inline; } /** * @tab Footer * @section social bar style * @tip Set the background color and border for your email's footer social bar. * @theme footer */ #social{ /*@editable*/ background-color:#FFFFFF; /*@editable*/ border:0; } /** * @tab Footer * @section social bar style * @tip Set the background color and border for your email's footer social bar. */ #social div{ /*@editable*/ text-align:left; } /** * @tab Footer * @section utility bar style * @tip Set the background color and border for your email's footer utility bar. * @theme footer */ #utility{ /*@editable*/ background-color:#FAFAFA; /*@editable*/ border-top:0; } /** * @tab Footer * @section utility bar style * @tip Set the background color and border for your email's footer utility bar. */ #utility div{ /*@editable*/ text-align:left; } #monkeyRewards img{ max-width:170px !important; } </style> </head>";
	return head;
}
//Creates ics File and returns File Name
function createiCal(userId,meetingTitle,icalDate,icalEmail,icalSTime,icalETime,objective,location,meetingID){
	//ical Module
	var iCalEvent = require('icalevent');
	var tempFileName='icsFiles/'+meetingID+'.ics';
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
	fileName+="";
	console.log("Deleting File: "+fileName);
	//Deletes File
	var fs= require('fs');
	fs.unlink(fileName, function (err) {
	  	if (err) {throw err;
	  		console.log('successfully deleted file');
	  	}else{
	  		//console.log('not deleted'+err);
	  	}
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

function getTaskList(meetingData){	
	var agendas = meetingData.agenda;
	var taskLists = {};
	for(var i = 0; i < agendas.length; i++){
		var tasks = agendas[i].tasks;
		//console.log(tasks);
		for(var j = 0; j < tasks.length; j++){
			var task = tasks[j];
			var assignees = task.assigneeName.split(', ');
			for(var k = 0; k < assignees.length; k++){
				if(assignees[k] != ""){
					if(taskLists[assignees[k]] == undefined){
						taskLists[assignees[k]] = new Array();
						taskLists[assignees[k]].push({"task" : task.task, "dueDate": task.taskDueDate});
					}
					else{
						taskLists[assignees[k]].push({"task" : task.task, "dueDate": task.taskDueDate});
					}
				}
			}
		}
	}
	return taskLists;
}