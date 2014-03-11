// config/passport.js

// load all the things we need
var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
// load up the user model
var User = require('../models/user-model');

// expose this function to our app using module.exports
module.exports = function(passport) {

	// =========================================================================
	// passport session setup ==================================================
	// =========================================================================
	// required for persistent login sessions
	// passport needs ability to serialize and unserialize users out of session

	// used to serialize the user for the session
	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	// used to deserialize the user
	passport.deserializeUser(function(id, done) {
		User.findById(id, function(err, user) {
			done(err, user);
		});
	});

	// =========================================================================
	// LOCAL SIGNUP ============================================================
	// =========================================================================
	// we are using named strategies since we have one for login and one for signup
	// by default, if there was no name, it would just be called 'local'

	passport.use('local-signup', new LocalStrategy({
		// by default, local strategy uses username and password, we will override with email
		usernameField : 'email',
		passwordField : 'password',
		passReqToCallback : true // allows us to pass back the entire request to the callback
	},
	function(req, email, password, done) {

		// find a user whose email is the same as the forms email
		// we are checking to see if the user trying to login already exists
		User.findOne({ 'local.email' :  email }, function(err, user) {
			// if there are any errors, return the error
			if (err)
				return done(err);

			// check to see if theres already a user with that email
			if (user) {
				return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
			} else {
				var name = req.body.firstName + " " + req.body.lastName;
				var accountType = req.body.accountType;
				// if there is no user with that email
				// create the user
				var newUser = new User();

				// set the user's local credentials
				newUser.local.accountType = accountType;
				newUser.local.name = name;
				newUser.local.email = email;
				newUser.local.password = newUser.generateHash(password);

				// save the user
				newUser.save(function(err) {
					if (err)
						throw err;
					console.log("Successfully added new user to database");
					User.find({'local.email': email}, function(e, docs){console.log(docs);});
					req.session.userId = email;
					req.session.name = name;
					req.session.accountType = accountType;
					return done(null, newUser);
				});
			}
		});        
	}));

	// =========================================================================
	// LOCAL LOGIN =============================================================
	// =========================================================================
	// we are using named strategies since we have one for login and one for signup
	// by default, if there was no name, it would just be called 'local'

	passport.use('local-login', new LocalStrategy({
		// by default, local strategy uses username and password, we will override with email
		usernameField : 'email',
		passwordField : 'password',
		passReqToCallback : true // allows us to pass back the entire request to the callback
	},
	function(req, email, password, done) { // callback with email and password from our form

		// find a user whose email is the same as the forms email
		// we are checking to see if the user trying to login already exists
		User.findOne({ 'local.email' :  email }, function(err, user) {
			// if there are any errors, return the error before anything else
			if (err)
				return done(err);

			// if no user is found, return the message
			if (!user)
				return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

			// if the user is found but the password is wrong
			if (!user.validPassword(password))
				return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

			req.session.userId = email;
			req.session.name = user.local.name;
			req.session.accountType = user.local.accountType;
			// all is well, return successful user
			console.log('THIS IS USER STUFF: ' + user);
			return done(null, user);
		});
	}));

	passport.use('google-login', new GoogleStrategy({
		clientID: '693576074665-5metufhdq7f2r5vogsiro86rf1uvtumj.apps.googleusercontent.com',
		clientSecret: 'tlvVeRLtCgk6_eEDCGPSNrlt',
		callbackURL: 'http://localhost:3000/auth/google/callback/',
		scope: 'profile email https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/calendar',
		passReqToCallback : true // allows us to pass back the entire request to the callback 
	 },
	function(req, accessToken, refreshToken, profile, done) {
		console.log(profile);
		User.findOrCreate({ 
			'google.id': profile.id, 
			'google.email': profile.emails[0].value,
			'google.name': profile.displayName
		}, function (err, user) {
			req.session.userId = user.google.id;
			req.session.email = user.google.email;
			req.session.name = user.google.name; 
			req.session.accessToken = accessToken;
			req.session.refreshToken = refreshToken;
			return done(err, user);
		});
	}));
};