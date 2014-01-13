
/*
 * GET home page.
 */

exports.index = function(req, res){
	res.render('home', {title: 'MeetingBuddy!'});
};

exports.home = function(req, res){
  res.render('home', { title: 'MeetingBuddy!' });
};

// administrator items

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

exports.login = function(req, res){
	res.render('login', { title : 'login'});
}


exports.adduser = function(db){
	return function(req, res){
		var userName = req.body.username;
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