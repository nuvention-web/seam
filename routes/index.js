
/*
 * GET home page.
 */
var mongoose = require('mongoose');
var Admin = require('../models/admin-model');
var Email = require('../models/email-model');
var Survey = require('../models/survey-model');

exports.index = function(req, res){
	res.render('home', {title: 'MeetingBuddy!'});
};

exports.home = function(req, res){
  res.render('home', { title: 'MeetingBuddy!' });
};

exports.survey = function(req, res){
	res.render('survey', {title: 'Survey'});
};

// administrator items

exports.confirm = function(req, res){
	var email = req.body.adminemail;
	var password = req.body.adminpassword;

	Admin.findOne({email: email}, function(err, admin){
		if(err)
			throw err;
		if(admin != null){
			admin.comparePassword(password, function(err, isMatch) {
				if(err){
					res.location('error');
					res.redirect('error');	
				}
				console.log(password, isMatch); // -> nuventionWeb: true
				req.session.isAdmin=true;
				res.location('admin');
				res.redirect('admin');
			});
		}
		res.location('error');
		res.redirect('error');
	});
};

exports.admin = function(req, res){
	if(req.session.isAdmin){
		Email.find({}, function(e, docs){
			res.render('admin', {
				'userlist': docs
			});
		});
	}
	else{
		res.location('login');
		res.redirect('login');
	}
};

exports.login = function(req, res){
	res.render('login', { title : 'login'});
};

exports.addadmin = function(req, res){
	var adminUser = new Admin({
		email: 'tyu3138@gmail.com',
		password: '123456789'
	});

	adminUser.save(function(err) {
		if (err){
			console.log('adding failed');
			throw err;
		}
		else{
			console.log('Successfully added adminUser');
			res.location('home');
			res.redirect('home');
		}
	});
};


exports.adduser = function(req, res){
	var userEmail = req.body.userEmail;
	var newEmail = new Email({email: userEmail});
	newEmail.save(function (err, doc){
			if(err){
			console.log('Problem adding information to database')
			res.location('error');
			res.redirect('error');
			}
			else{
				console.log('Added new email successfully');
				Email.find({}, function(e, docs){console.log(docs);});
				res.location('survey');
				res.redirect('survey');
			}
		}
	);
};

exports.addsurvey = function(req, res){
	var firstName = req.body.firstName;
	var lastName = req.body.lastName;
	var industry = req.body.industry;
	var func = req.body.func;
	var meetingFrequency = req.body.meetingFrequency;
	var frustration = req.body.frustration;

	console.log(firstName);

	var newSurvey = new Survey({
		firstName: firstName,
		lastName: lastName,
		industry: industry,
		func: func,
		meetingFrequency: meetingFrequency,
		frustration: frustration
	});

	newSurvey.save(function(err, doc){
		if(err){
			console.log('Problem adding information to database')
			res.location('error');
			res.redirect('error');
		}
		else{
			console.log('Added new survey successfully');
			Survey.find({}, function(e, docs){console.log(docs);});
			res.location('home');
			res.redirect('home');
		}
	});
};

// Error page

exports.error = function(req, res){
	res.render('error', {title: 'Error'});
};