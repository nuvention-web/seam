
var mongoose = require('mongoose');
var Email = require('../models/email-model');
var Survey = require('../models/survey-model');
var nodemailer = require('nodemailer');
exports.home = function(req, res){
	res.render('landingPage/home', { title: 'SEAM', user : req.user});
};
exports.about = function(req, res){
	res.render('landingPage/about', { title: 'SEAM', user : req.user});
};
exports.contact = function(req, res){
	res.render('landingPage/contact', { title: 'SEAM', user : req.user});
};
exports.login = function(req, res){
	res.render('landingPage/login', { title: 'SEAM', user : req.user});
};

exports.survey = function(req, res){
	res.render('landingPage/survey', {title: 'Survey', user : req.user});
};

exports.addEmail = function(req, res){
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
				res.redirect('survey');
			}
		}
	);
};
exports.contactForm = function(req, res){
	console.log("hi");
	var names = req.body.names;
	var emails = req.body.email;
	var comments = req.body.comments;
	var smptpConfig;
	//email function
	smtpConfig = nodemailer.createTransport('SMTP', {
	service: 'Gmail',
	auth: {
		user: "seammeetingscontact@gmail.com",
	 	pass: "123456789a!"
	}
	 });
	emailBody = {
		 	from: "SEAM Meetings <seammeetingscontact@gmail.com>",
			to: 'miketychen@gmail.com',
		 	subject: '[SEAM] Contact: '+names,
		 	text: 'Name: '+names+'\nEmail: '+ emails+'\nComments: '+comments
	 };
	//send Email
	 smtpConfig.sendMail(emailBody, function (error, response) {
	//Email not sent
 	if (error) {
		res.end("Email Failed");
 	}
 	//email send sucessfully
	else {
		res.end("Email Successfully");
 	}

 });

	res.redirect('home');
};
exports.addSurvey = function(req, res){
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
			res.redirect('home', {user : req.user});
		}
	});
};