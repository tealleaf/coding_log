const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');

const router = express.Router();

// Load Users Model... weird, not like modules
require('../models/Users');
const User = mongoose.model('users'); //this is what you named it in the file

// User Login Route
router.get('/login', (req, res) => {
  res.render('users/login', {
  	
  });
});

// User Login POST (why pass next in here I wonder)
router.post('/login', (req, res, next) => {
	
	//passport doesn't know what local is yet so we need to make a folder named Config.
	//We have to define our strategies in a separate folder for passport.js
	passport.authenticate('local', {
		successRedirect: '/timeCoded',
		failureRedirect: '/users/login',
		failureFlash: true
	})(req, res, next); //we want this to fire off... again. Uh why?

});

// User Register Route 
router.get('/register', (req, res) => {
  res.render('users/register', {
  	
  });
});

// User Register POST
router.post('/register', (req, res) => {
	let errors = [];
	
	if(req.body.password != req.body.password2) {
		errors.push('Passwords do not match.');
	}
	if(req.body.password.length < 4) {
		errors.push('Password must be at least 4 characters.');
	}

	if(errors.length > 0) {
		res.render('users/register', {
			errors,
			name: req.body.name,
			email: req.body.email,
			password: req.body.password,
			password2: req.body.password2
		});
		console.log(errors);
	}
	else {
		//see if there's duplicate in the database. 
		User.findOne({
			email: req.body.email
		}).then(user => {
			if(user) {
				req.flash('error_msg', 'Email has already been taken.');
				res.redirect('/users/register');
			} else {
				//how it gets into the database
				const newUser = new User({
					name: req.body.name,
					email: req.body.email,
					password: req.body.password
				})
				console.log(newUser);

				//Encryption
				bcrypt.genSalt(10, (err, salt) => {
					bcrypt.hash(newUser.password, salt, (err, hash) => {
						if(err) throw err;
						newUser.password = hash;
						newUser.save().then(user => { //promise
							req.flash('success_msg', 'You are now registered!'); //why do we need Flash again? Why is this req instead of res?
							res.redirect('/users/login');
						}).catch(err => {
							console.log(err);
							return;
						});
					});
				});
			}
		});
		
	}
});

// User LOGOUT 
router.get('/logout', (req, res) => {
	req.logout();
	req.flash('success_msg', 'Logged out.');
	res.redirect('/users/login');
});

module.exports = router;