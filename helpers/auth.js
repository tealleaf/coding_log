module.exports = {
	ensureAuthentication: function(req, res, next) { 
		//req.isAuthenticated is passport stuff... don't we need to import passport inthen?
		if(req.isAuthenticated()) {
			return next();
		}
		req.flash('error_msg', 'Please log in.');
		res.redirect('/users/login');
	}
}