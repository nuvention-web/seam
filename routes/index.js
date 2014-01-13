
/*
 * GET home page.
 */

exports.index = function(req, res){
	res.render('home', {title: 'MeetingBuddy!'});
};

exports.home = function(req, res){
  res.render('home', { title: 'MeetingBuddy!' });
};

exports.admin = function(db){
	return function(req, res){
		var collection = db.get('usercollection');
		collection.find({}, {}, function(e, docs){
			res.render('userlist', {
				'userlist' : docs
			});
		})
	};
};

exports.newuser = function(req, res){
	res.render('newuser', {title: 'add new user'});
};

exports.adduser = function(db){
	return function(req, res){
		var userName = req.body.username;
		var userEmail = req.body.useremail;

		var collection = db.get('usercollection');

		collection.insert({
			"Name" : userName,
			"Email" : userEmail		
			}, function (err, doc){
				if(err){
					res.send("Problem adding information to database")
				}
				else{
					res.location("home");
					res.redirect("home");
				}
			}
		);
	}
}