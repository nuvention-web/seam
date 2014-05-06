var mongoose = require('mongoose');
var User = require('../models/user-model');

exports.signup = function(req, res){
	res.render('landingPage/signup', { message: req.flash('signupMessage'), user : req.user });
};

exports.logout = function(req, res){
	req.logout();
	res.redirect('/');
};

// exports.login = function(req, res) {
// 	res.render('login.ejs', { message: req.flash('loginMessage') }); 
// });

exports.isLoggedIn = function(req, res, next) {

	// if user is authenticated in the session, carry on 
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
};