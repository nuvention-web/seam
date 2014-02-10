
/**
 * Module dependencies.
 */
var home = require('./routes/home');
var user = require('./routes/user');
var admin = require('./routes/admin');
var task = require('./routes/task');
var interfaces = require('./routes/interfaces');
var index = require('./routes/index');
var http = require('http');
var path = require('path');

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

//main page
app.get('/', home.home);
app.get('/home', home.home);
app.get('/survey', home.survey);
app.post('/addsurvey', home.addsurvey);
app.post('/addemail', home.addemail);

//admin page
app.get('/admin', admin.admin);
app.get('/addadmin', admin.addadmin);
app.post('/confirm', admin.confirm);

//Interface

app.get('/interfaceAddMeeting', user.isLoggedIn, interfaces.interfaceAddMeeting);
app.get('/interfaceMeetings', user.isLoggedIn, interfaces.interfaceMeetings);
app.get('/interfaceNewMeeting', user.isLoggedIn, interfaces.interfaceNewMeeting);
app.get('/interfaceProjects', user.isLoggedIn, interfaces.interfaceProjects);
app.get('/interfaceStartMeeting', user.isLoggedIn, interfaces.interfaceStartMeeting);
app.get('/interfaceTasks', user.isLoggedIn, interfaces.interfaceTasks);
app.get('/interfaceWelcome', user.isLoggedIn, interfaces.interfaceWelcome);
app.get('/sidebarMeetings', user.isLoggedIn, interfaces.sidebarMeetings);
app.get('/sidebarNavbar', user.isLoggedIn, interfaces.sidebarNavbar);
app.get('/sidebarTasks', user.isLoggedIn, interfaces.sidebarTasks);
app.post('/addmeeting', user.isLoggedIn, interfaces.addMeeting);
app.post('/addnote', user.isLoggedIn, interfaces.addNote);
app.post('/addTask', user.isLoggedIn, interfaces.addTask);

//product stuff
app.get('/meetingTask', user.isLoggedIn, task.meetingTask);
app.get('/meetingTask2', user.isLoggedIn, task.meetingTaskDone);
app.get('/personalDashboard', user.isLoggedIn, task.personalDashboard);
app.get('/personalDashboard2', user.isLoggedIn, task.personalDashboard2);
app.get('/profile', user.isLoggedIn, task.profile);
app.post('/finishTask', user.isLoggedIn, task.finishTask);
app.post('/deletetask', user.isLoggedIn, task.deleteTask);

//account
app.get('/signup', user.signup);
app.get('/logout', user.logout);
//app.post('/login', user.login);
app.post('/signup', passport.authenticate('local-signup', {// process the signup form
	successRedirect: '/interfaceProjects', // redirect to the secure profile section
	failureRedirect: '/signup', // redirect back to the signup page if there is an error
	failureFlash: true // allow flash messages
}));
app.post('/login', passport.authenticate('local-login', {
	successRedirect: '/interfaceProjects', // redirect to the secure profile section
	failureRedirect: '/home', // redirect back to the signup page if there is an error
	failureFlash: true // allow flash messages
}));

//error page
app.get('/error', index.error);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
