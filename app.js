
/**
 * Module dependencies.
 */

//Hello

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

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

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/home', routes.home);
app.get('/users', user.list);
app.get('/admin', routes.admin);
app.get('/survey', routes.survey);
app.get('/meetingTask', routes.meetingTask);
app.post('/addtask', routes.addtask);
app.get('/addadmin', routes.addadmin);
app.get('/error', routes.error);
app.get('/newpage', routes.newpage);
app.post('/addsurvey', routes.addsurvey);
app.post('/confirm', routes.confirm);
app.post('/adduser', routes.adduser);


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
