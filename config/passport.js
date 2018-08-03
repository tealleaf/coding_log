//Remember, passport is used to authenticate, so we would need bcrypt to grab our matching password
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Users Model
const User = mongoose.model('users');

//basically passing a function to use
//So... does modules.export essentially make it global? Not exactly... kind of like locked global
//accessible to those who import. This is called in app.js btw. And THEN I guess it's accessible
//in users.js because users.js is a route. Makes me wonder if app.use is actually linking files together
//under circumstances. Kind of like hbs partials but in javascript.
//BASICALLY: config/passport.js --> app.js <--> routes/users.js
module.exports = function(passport) { 
	/*
		Basically this whole function does authentication to see if what we enter in the form matches the db.
	*/
	passport.use(new LocalStrategy({ //this basically defines the 'local' strategy line 24 users.js
		usernameField: 'email'
	}, (email, password, done) => {

		//Finds the user
		User.findOne({
			email
		}).then(user => {
			if(!user){ //no user found with this email in the database.
				return done(null, false, {message: 'No user found.'}); //false for user bc no match
			}
			//Finds the password (user.password) comes from the parameter, which was passed in as the found user
			bcrypt.compare(password, user.password, (err, isMatch) => {
				if(err) throw err;
				if(isMatch) {
					return done(null, user); //first parameter is error. We have no error if there's a match.
				} else {
					return done(null, false, {message: 'Wrong password or user.'});
				}
			});
		});
		
	})); //the callback is done

	//For cookies and sessions. 
	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
		User.findById(id, function(err, user) {
			done(err, user);
		});
	});
}