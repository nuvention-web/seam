var mongoose = require('mongoose');
var Project = require('../models/project-model');


exports.team = function(req, res){
	Project.findOne({'_id': req.session.projectId}, function(e, doc){
		console.log(doc);
		// groupMembers = new Array();
		// for(var i =0; i < doc.groupMembers.length; i++){
		// 	var fullName = doc.groupMembers[i].memberName;
		// 	var splitName = fullName.split(' ');
		// 	var firstName = splitName[0];
		// 	console.log(fullName + " " + firstName);
		// 	groupMembers[i] = doc.groupMembers[i];
		// }
		res.render('loggedIn/team/team', { 
			memberList: doc.groupMembers,
			title: 'SEAM',
			projectName: req.session.projectName, 
			user : req.user});
	});	
};

exports.addMember = function(req, res){
	var memberName = req.body.memberName;
	var memberEmail = req.body.memberEmail;
	console.log(req.session.projectId);
	console.log(memberEmail + " " + memberName);
	Project.findOne({'_id': req.session.projectId}, function(e, doc){
		console.log(doc._id);
		console.log(doc.groupMembers);
		doc.groupMembers.push({
			memberName: memberName,
			memberEmail: memberEmail
		});
		doc.save(function(err, doc){
			if(err){
				console.log('Problem adding new member to database')
				console.log(err);
				res.location('error');
				res.redirect('error', {user : req.user});
			}
			else{
				console.log('Added member successfully');
				Project.find({}, function(e, docs){console.log(docs);});
			}
		});	
		res.redirect('back');
	})
}