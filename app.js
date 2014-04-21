
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
var meeting = require('./routes/asyncMeetingStruct');
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

// adding functionality to javascript array
Array.prototype.contains = function(k, callback) {  
    var self = this;
    return (function check(i) {
        if (i >= self.length) {
            return callback(false);
        }
        if (self[i] === k) {
            return callback(true);
        }
        return process.nextTick(check.bind(null, i+1));
    }(0));
};

var people = {};  
var meetingsList = {};  
var clients = [];

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

socket.on("connection", function (client) {  
	
	client.on("join", function(name, userId) {
		var meetingId = null;
	    people[client.id] = {"name" : name, "userId": userId, "meeting" : meetingId};
	    client.emit("update", "You have connected to the server.");
	    socket.sockets.emit("update", people[client.id].name + " has logged in.")
	    socket.sockets.emit("update-people", people);
	    client.emit("meetingList", {meetingsList: meetingsList});
	    clients.push(client); //populate the clients array with the client object
	});

	client.on("startMeeting", function(name, userId, meetingId) {  
		if (people[client.id].meeting === null) {
			var meeting = new meetingsListtruct(name, userId, meetingId, client.id);
			meetingsList[client.id] = meeting;
			socket.sockets.emit("meetingList", {meetingsList: meetingsList}); //update the list of rooms on the frontend
			client.room = meetingId; //name the room
			client.join(client.room); //auto-join the creator to the room
			meetingsList.addPerson(client.id); //also add the person to the room object
			people[client.id].meeting = meetingId; //update the room key with the ID of the created room
			people[client.id].owns = meetingId;
 			socket.sockets.emit("meetingStarted", "meetingId");
		} else {
			socket.sockets.emit("update", "already started meeting");
		}
	});

	client.on("joinMeeting", function(name, userId) {  
		var meeting = meetingsList[client.id];
		if (client.id === meeting.owner) {
			client.emit("update", "You are the starter of this meeting and you have already joined.");
		} 
		else {
			meetingsList.people.contains(client.id, function(found) {
				if (found) {
				  client.emit("update", "You are already in this meeting.");
				} 
				else {
					meeting.addPerson(client.id);
					client.room = meeting.meetingId;
					client.join(client.room); //add person to the room
					user = people[client.id];
					socket.sockets.in(client.room).emit("update", user.name + " has connected to meeting.");
				}
			});
		}
	});

	client.on("send", function(msg, value) {  
		socket.sockets.in(client.room).emit("newNoteOrTask", people[client.id], msg, value);
	});

	client.on("finishMeeting", function(name, userId) {  
		var meeting = meetingsList[client.id];
		if(meeting){
			if (client.id === meeting.owner) {// only owner can finish meeting
				var i = 0;
				while(i < clients.length) {
			  		if(clients[i].id == meeting.people[i]) {
			   			clients[i].leave(meeting.meetingId);
			  		}
			  		i++;
				}
				delete meeting[client.id];
				people[meeting.owner].owns = null; //reset the owns object to null so new meeting can be started
				socket.sockets.emit("roomList", {meetingsList: meetingsList});
				socket.sockets.in(client.room).emit("update", "The owner (" +user.name + ") finished the meeting. The meeting is removed.");
			}
		}
	});
});

//Landing Page
app.get('/', landingPage.home);
app.get('/home', landingPage.home);
app.get('/login', landingPage.login);
app.get('/survey', landingPage.survey);
app.post('/addSurvey', landingPage.addSurvey);
app.post('/addEmail', landingPage.addEmail);
app.post('/contact', landingPage.contact);
//Dashboard
app.get('/dashboard', user.isLoggedIn, dashboard.dashboard);
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
app.post('/dashboard/meetings/join', user.isLoggedIn, meetings.joinMeeting);
app.post('/dashboard/meetings/start/addNote', user.isLoggedIn, meetings.addNote);
app.post('/dashboard/meetings/start/addTask', user.isLoggedIn, meetings.addTask);
app.get('/dashboard/meetings/end', user.isLoggedIn, meetings.endMeeting);


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
