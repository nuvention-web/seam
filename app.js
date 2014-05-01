
/**
 * Module dependencies.
 */
var landingPage = require('./routes/landingPage');
var dashboard = require('./routes/dashboard');
var meetings = require('./routes/meetings');
var user = require('./routes/user');
var task = require('./routes/task');
var index = require('./routes/index');
var team = require('./routes/team');
var meetingStruct = require('./routes/asyncMeetingStruct');
var http = require('http');
var path = require('path');
//include the nodemailer module
var nodemailer = require('nodemailer');

var flash = require('connect-flash');
var express = require('express');
// login
var passport = require('passport');
require('./config/passport')(passport)

// database setup
var mongoUri = process.env.MONGOLAB_URI ||
	process.env.MONGOHQ_URL ||
  	'mongodb://localhost:27017/MeetingBuddy';

console.log(mongoUri);

var mongo = require('mongodb');
var mongoose = require('mongoose');
mongoose.connect(mongoUri);
mongoose.connection.on("open", function(){
  console.log("Connected to database");
});

var db = mongoose.connection;

// server setup
var app = express();

var people = {};  
var meetingsList = {};  
var queue = {};
var clients = {};
var peopleInMeeting = {};

// all environments
app.configure(function(){
	app.set('port', process.env.PORT || 3000);
	app.set('views', path.join(__dirname, 'views'));
	app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.json());
	app.use(express.urlencoded());
	app.use(express.methodOverride());
	app.use(express.cookieParser());
	app.use(express.session({ secret: 'ilovemeetingbuddy' }));
	app.use(express.static(path.join(__dirname, 'public')));
	app.use(flash());
	app.use(passport.initialize());
	app.use(passport.session()); // persistent login sessions
	app.use(app.router);
});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//server listening
var server = app.listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});

var socket = require('socket.io').listen(server);


// socket.io stuff
socket.on("connection", function (client) {  

	client.on("join", function(name, userId, meetingId) {
		var meetingId = null;
	    people[client.id] = {"name" : name, "userId": userId, "meeting" : meetingId};
	    client.emit("update", "You have connected to the server.");
	    client.emit("update", people[client.id].name + " has logged in.")
	    client.emit("meetingList", {meetingsList: meetingsList});
	    clients[client.id] = {"clientObject" : client, "userId" : userId, "name" : name}; //populate the clients object array with the client object
	});

	client.on("startMeeting", function(name, userId, meetingId) {
		if (meetingsList[meetingId] === undefined) {//meeting has not been started yet create new meeting
			var meeting = new meetingStruct(name, userId, meetingId, client.id);
			meetingsList[meetingId] = meeting;
			socket.sockets.emit("meetingList", {meetingsList: meetingsList}); //update the list of rooms on the frontend
			client.room = meetingId; //name the room
			client.join(client.room); //auto-join the creator to the room
			meeting.addPerson(client.id, userId); //also add the person to the room object
			peopleInMeeting[userId] = {"name" : name, "userId": userId, "meeting" : meetingId};
 			socket.emit("update", "you have started the meeting")
 			if(queue[meetingId] != undefined){
 				queueList = queue[meetingId];
 				for(var i = 0; i < queueList.length; i++){
 					queueList[i].client.join(client.room);
 					meeting.addPerson(queueList[i].userId);
 				}
 			}
 			console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@------" + meeting.people + "------------@@@@@@@@@@@@@@@@@@@@@@@@@");
 			var user = people[client.id];
 			delete queue[meetingId];
 			socket.sockets.in(client.room).emit("meetingStarted", "meeting has been started by " + user.name , meetingId);
		} else {// meeting has already been made, user most likely accidentally left the room
			var meeting = meetingsList[meetingId];
			meeting.owner = client.id;
			client.room = meetingId; //name the room
			client.join(client.room); //auto-join the creator to the room
			meeting.addPerson(client.id, userId); //also add the person to the room object
			client.emit('meetingRestarted', 'you have restarted your meeting', meetingId);
			var members = meeting.people;
			for(var i = 0; i < members.length; i++){
				var clientId = members[i].clientId;
				clients[clientId].clientObject.join(client.room);
			}
			if(queue[meetingId] != undefined){
 				queueList = queue[meetingId];
 				for(var i = 0; i < queueList.length; i++){
 					queueList[i].client.join(client.room);
 					meeting.addPerson(queueList[i].userId);
 				}
 			}
			var user = people[client.id];
			socket.broadcast.to(client.room).emit("meetingRestarted", "meeting has been restarted by " + user.name, meetingId);
		}
	});

	client.on("joinMeeting", function(name, userId, meetingId) {  
		var meeting = meetingsList[meetingId];
		if(meeting == undefined){
			client.emit("joinFailure", "Meeting has not been started yet.");
			if(queue[meetingId] == undefined){
				queue[meetingId] = new Array();
				queue[meetingId].push({"id" : client.id, "client" : client, "userId": userId});
				client.emit("update", "added to waiting queue");
			}
			else{
				queue[meetingId].push({"id" : client.id, "client" : client, "userId": userId});
				client.emit("update", "added to waiting queue");
			}
		}
		else{
			if(peopleInMeeting[userId]){
				var owner = meeting.owner;
				var meetingStartedByOwner = false;
				for(var i = 0; i < meeting.people.length; i++){
					if(meeting.people[i].userId == owner){
						meetingStartedByOwner = true;
					}
				}
				if(meetingStartedByOwner){
					client.room = meeting.meetingId;
					client.join(client.room); //add person to the room
					meeting.addPerson(client.id, userId); //also add the person to the room object
					var user = people[client.id];
					client.emit("meetingStarted", "Successfully rejoined the meeting", meetingId);
					client.broadcast.to(client.room).emit("userJoined", user.name + " has joined the meeting.");
				}
				else{
					if(queue[meetingId] == undefined){
						meeting.addPerson(client.id, userId);
						queue[meetingId] = new Array();
						queue[meetingId].push({"id" : client.id, "client" : client, "userId": userId});
						client.emit("joinFailure", "added to waiting queue on rejoin");
					}
					else{
						meeting.addPerson(client.id, userId);
						queue[meetingId].push({"id" : client.id, "client" : client, "userId": userId});
						client.emit("joinFailure", "added to waiting queue on rejoin");
					}
				}
			}
			else{
				client.room = meeting.meetingId;
				client.join(client.room); //add person to the room
				meeting.addPerson(client.id, userId); //also add the person to the room object
				peopleInMeeting[userId] = {"name" : name, "userId": userId, "meeting" : meetingId};
				var user = people[client.id];
				client.emit("meetingStarted", "Successfully joined the meeting", meetingId);
				client.broadcast.to(client.room).emit("userJoined", user.name + " has joined the meeting.");
			}
		}
	});
 
	client.on("sendNote", function(note, value, meetingId) {
		client.room = meetingId;
		client.broadcast.to(client.room).emit("newNote", note, value, meetingId);
	});

	client.on("sendTask", function(taskAssignee, task, value, meetingId) {
		client.room = meetingId;
		client.broadcast.to(client.room).emit("newTask", taskAssignee, task, value, meetingId);
	});

	// client.on("updateTimer", function(elapsedTimeArray, meetingId){
	// 	client.room = meetingId;
	// 	client.broadcast.to(client.room).emit("newTime", elapsedTimeArray, "syncing time with creator time", meetingId);
	// });

	client.on("leaveMeetingCreator", function(name, userId, meetingId){
		var meeting = meetingsList[meetingId];
		if(meeting){
			if (userId === meeting.owner) {// only owner can finish meeting
				client.room = meeting.meetingId;
				var user = people[client.id];
				client.broadcast.to(client.room).emit("creatorLeft", "The meeting starter(" + user.name + ") left the meeting.", meetingId);
				socket.sockets.emit("roomList", {meetingsList: meetingsList});
				meeting.removePerson(client.id, userId);
				client.emit("update", "you have left the meeting")
				client.leave(client.room)
				delete people[client.id];
				delete clients[client.id];
			}
		}
	});

	client.on("leaveMeetingAttendee", function(name, userId, meetingId){
		var meeting = meetingsList[meetingId];
		if(meeting){
			client.room = meeting.meetingId;
			var user = people[client.id];
			client.broadcast.to(client.room).emit("userLeft", user.name + " has left the meeting.", meetingId);
			socket.sockets.emit("roomList", {meetingsList: meetingsList});
			meeting.removePerson(client.id, userId);
			client.emit("update", "you have left the meeting")
			client.leave(client.room)
			var queueList = queue[meetingId];
			if(queueList){
				var i = queueList.length;
				while(i--){
					if(queueList[i].userId === userId){
					      break;
					}
				}
				if(i >= 0){
					queueList.splice(i , 1);
				}
			}
			delete people[client.id];
			delete clients[client.id];
		}
	});

	client.on("finishMeeting", function(name, userId, meetingId) {  
		var meeting = meetingsList[meetingId];
		if(meeting){
			if (client.id === meeting.owner) {// only owner can finish meeting
				client.room = meeting.meetingId;
				var user = people[client.id];
				client.broadcast.to(client.room).emit("finish", "The owner (" + user.name + ") finished the meeting.", meetingId);
				delete meetingsList[meetingId];
				people[client.id].owns = null; //reset the owns object to null so new meeting can be started
				socket.sockets.emit("roomList", {meetingsList: meetingsList});
				client.emit("update", "you have finished the meeting")
				delete peopleInMeeting[userId];
				for(var i = 0; i < meeting.people.length; i++){
					var attedeeId = meeting.people[i].userId;
					var clientId = meeting.people[i].clientId
					var clientObject = clients[clientId].clientObject;
					clientObject.emit("update", "meeting has been finished, you have left the meeting");
					clientObject.leave(meeting.meetingId);
					delete peopleInMeeting[attedeeId];
					delete people[clientId];
					delete clients[clientId];
				}
			}
		}
	});
});

//Landing Page
app.get('/', landingPage.home);
app.get('/home', landingPage.home);
app.get('/about', landingPage.about);
app.get('/contact', landingPage.contact);
app.get('/login', landingPage.login);
app.get('/survey', landingPage.survey);
app.post('/addSurvey', landingPage.addSurvey);
app.post('/addEmail', landingPage.addEmail);
app.post('/contactForm', landingPage.contactForm);
app.post('/feedbackForm', dashboard.feedbackForm);
//Dashboard
app.get('/dashboard', user.isLoggedIn, dashboard.dashboard);
app.get('/dashboard/contact', user.isLoggedIn, dashboard.contact);
// app.post('/dashboard', user.isLoggedIn, dashboard.setWelcome);
// app.get('/dashboard/meetings', user.isLoggedIn, dashboard.meetings);

//Dashboard-Meetings
app.get('/dashboard/meetings/makeMeeting', user.isLoggedIn, meetings.makeMeeting);
app.get('/dashboard/meetings/makeMeeting/new', user.isLoggedIn, meetings.makeNewMeeting);
app.post('/dashboard/meetings/makeMeeting/add', user.isLoggedIn, meetings.addMeeting);

//update and edit meetings
app.post('/dashboard/meetings/edit', user.isLoggedIn, meetings.editMeeting);
app.post('/dashboard/meetings/edit/update', user.isLoggedIn, meetings.updateMeeting);

app.post('/dashboard/meetings/view', user.isLoggedIn, meetings.viewMeeting);
app.post('/dashboard/meetings/view/past', user.isLoggedIn, meetings.viewPast);
app.get('/dashboard/meetings/view/pastMeeting', user.isLoggedIn, meetings.pastMeeting);

app.get('/dashboard/meetings/pastMeeting', user.isLoggedIn, meetings.pastMeeting);

app.post('/dashboard/meetings/start', user.isLoggedIn, meetings.postMeeting);
app.get('/dashboard/meetings/start', user.isLoggedIn, meetings.getMeeting);
app.post('/dashboard/meetings/join', user.isLoggedIn, meetings.postJoinMeeting);
app.get('/dashboard/meetings/join', user.isLoggedIn, meetings.getJoinMeeting);
app.post('/dashboard/meetings/start/addNote', user.isLoggedIn, meetings.addNote);
app.post('/dashboard/meetings/start/addTask', user.isLoggedIn, meetings.addTask);
app.post('/dashboard/meetings/end', user.isLoggedIn, meetings.endMeeting);

app.post('/dashboard/meetings/start/updateTime', user.isLoggedIn, meetings.updateTimer);
//Tasks
// app.get('/dashboard/tasks', user.isLoggedIn, task.getTasks);
// app.post('/dashboard/tasks/current', user.isLoggedIn, task.getTasksByMeeting);

// team member stuff
app.get('/dashboard/team', user.isLoggedIn, team.team);
app.post('/addMember', user.isLoggedIn, team.addMember);

//app.post('/dashboard/meetings/startMeeting', user.isLoggedIn, meetings.startMeeting);
//app.get('/tasks', user.isLoggedIn, interfaces.tasks);

//app.get('/sidebarMeetings', user.isLoggedIn, interfaces.sidebarMeetings);
//app.get('/sidebarNavbar', user.isLoggedIn, interfaces.sidebarNavbar);
//app.get('/sidebarTasks', user.isLoggedIn, interfaces.sidebarTasks);
//app.post('/addmeeting', user.isLoggedIn, interfaces.addMeeting);
//app.post('/addnote', user.isLoggedIn, interfaces.addNote);
//app.post('/addTask', user.isLoggedIn, interfaces.addTask);
//app.post('/addproject', user.isLoggedIn, interfaces.addProject);
//app.get('/finishMeeting', user.isLoggedIn, interfaces.finishMeeting);
//app.get('/pastMeeting', user.isLoggedIn, interfaces.pastMeeting);
//app.post('/viewPastMeeting', user.isLoggedIn, interfaces.viewPastMeeting);




//product stuff
// app.post('/finishTask', user.isLoggedIn, task.finishTask);
// app.post('/deletetask', user.isLoggedIn, task.deleteTask);

//account
app.get('/signup', user.signup);
app.get('/logout', user.logout);
app.post('/signup', passport.authenticate('local-signup', {// process the signup form
	successRedirect: '/dashboard', // redirect to the secure profile section
	failureRedirect: '/signup', // redirect back to the signup page if there is an error
	failureFlash: true // allow flash messages
}));
app.post('/login', passport.authenticate('local-login', {
	successRedirect: '/dashboard', // redirect to the secure profile section
	failureRedirect: '/home', // redirect back to the signup page if there is an error
	failureFlash: true // allow flash messages
}));
app.get('/google/login', passport.authenticate('google-login'));
app.get('/auth/google/callback',  passport.authenticate('google-login', {
	successRedirect: '/dashboard', // redirect to the secure profile section
	failureRedirect: '/', // redirect back to the signup page if there is an error
	failureFlash: true // allow flash messages
}))
//error page
app.get('/error', index.error);
