var mongoose = require('mongoose');
var Admin = require('../models/user-model');
var Email = require('../models/email-model');

exports.admin = function(req, res){
	if(req.session.isAdmin){
		Email.find({}, function(e, docs){
			res.render('admin', {
				'userlist': docs
			});
		});
	}
	else{
		res.location('home');
		res.redirect('home');
	}
};

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
				console.log(password + ": " + isMatch); // -> nuventionWeb: true
				if(isMatch){
					req.session.isAdmin=true;
					res.location('admin');
					res.redirect('admin');
				}
				else{
					res.location('error');
					res.redirect('error');	
				}
			});
		}
		res.location('error');
		res.redirect('error');
	});
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
