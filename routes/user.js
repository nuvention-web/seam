var mongoose = require('mongoose');
var User = require('../models/user-model');

exports.signup = function(req, res){
	res.render('signup', { message: req.flash('signupMessage') });
};

exports.logout = function(req, res){
	res.render('home', {title : 'MeetingBuddy!'});
};

// exports.login = function(req, res) {
// 	res.render('login.ejs', { message: req.flash('loginMessage') }); 
// });

exports.isLoggedIn = function(req, res, next) {

	// if user is authenticated in the session, carry on 
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.location('home');
	res.redirect('home');
};