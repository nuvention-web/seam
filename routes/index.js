
/*
 * GET home page.
 */
// Error page
exports.error = function(req, res){
	res.render('error', {title: 'Error', user : req.user});
};

