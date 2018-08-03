const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const {ensureAuthentication} = require('../helpers/auth'); //you're pulling the function out to use from this file. Important that the function name is EXACTLY as listed in helper file.

// Load Authenticating Helper
//require('../helpers/auth');

// Load Coding Log Model
require('../models/CodingLog');
const TimeCoded = mongoose.model('timeCoded');

// These used to be app.get... but since we're using this like partials, we use router.
// TimeCoded Index Page, loads up your log
router.get('/', ensureAuthentication, (req, res) => { //this used to be '/ideas', but since it's in ideas.js, it will still be the same in url
  TimeCoded.find({user: req.user.id}) //so that we will only get the id of the person logged in.
    .sort({date:'desc'}) //sort by descending date, we want the latest date first for our log.
    .then(timeCoded => { //our database object passes in here
      res.render('codingLogView/index', { //object of objects
        timeCoded
      });
    });
});

// Add timeCoded Form, grabs the add page
router.get('/add', ensureAuthentication, (req, res) => {
  res.render('codingLogView/add');
});

// Edit timeCoded Form
/*
  1. Checks to see if you're allowed to be here (logged in)
  2. Check who you are 
*/
router.get('/edit/:id', ensureAuthentication, (req, res) => {
  TimeCoded.findOne({
    _id: req.params.id
  })
  .then(timeCoded => {
    if(timeCoded.user != req.user.id) { //sees if database user matches form user, if not --> error
      req.flash('error_msg', 'You are not authorized to make these changes.');
      res.redirect('/codingLogView');
    } else { //if matches, gives you the timeCoded database object
      res.render('codingLogView/edit', {
        timeCoded
      });
    }
    
  });
});

// Process Form
router.post('/', ensureAuthentication, (req, res) => { //when you go to 5000/timeCoded
  let errors = [];

  if(!req.body.goal){
    errors.push({text:'Please add a goal.'});
  }
  if(!req.body.timeCoded){
    errors.push({text:'Please add the time coded in minutes.'});
  }

  if(errors.length > 0){
    res.render('/add', {
      errors: errors,
      goal: req.body.goal,
      timeCoded: req.body.timeCoded
    });
  } else {
    const newUser = {
      goal: req.body.goal,
      timeCoded: req.body.timeCoded,
      user: req.user.id //remember, user is global
    }
    new TimeCoded(newUser)
      .save() //create
      .then(timeCoded => {
        req.flash('success_msg', 'Coding time added!');
        res.redirect('/timeCoded');
      })
  }
});

// Edit Form process
router.put('/:id', ensureAuthentication, (req, res) => { //use to update data
  TimeCoded.findOne({
    _id: req.params.id
  })
  .then(timeCoded => { //passes object of idea, or basically the return of findOne()
    // new values
    console.log(timeCoded); 
    timeCoded.goal = req.body.goal;
    timeCoded.timeCoded = req.body.timeCoded;

    timeCoded.save() //create
      .then(timeCoded => {
        req.flash('success_msg', 'TimeCoded updated');
        res.redirect('/timeCoded');
      })
  });
});

// Delete TimeCoded
router.delete('/:id', ensureAuthentication, (req, res) => {
  TimeCoded.remove({_id: req.params.id})
    .then(() => {
      req.flash('success_msg', 'TimeCoded removed.');
      res.redirect('/timeCoded');
    });
});

//we can export this as app.
module.exports = router;