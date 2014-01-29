
/*
 * GET home page.
 */
var mongoose = require('mongoose');
var Email = require('../models/email-model');
var Survey = require('../models/survey-model');

exports.home = function(req, res){
  res.render('home', { title: 'MeetingBuddy!' });
};

exports.survey = function(req, res){
	res.render('survey', {title: 'Survey'});
};

exports.addemail = function(req, res){
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