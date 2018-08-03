const express = require('express');
const path = require('path'); //in order to make public folder static, join file paths, etc...
const exphbs  = require('express-handlebars');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport'); //so... just because I included it below doesn't mean this should be empty.

const app = express();

// Load routes
const timeCoded = require('./routes/timeCoded');
const users = require('./routes/users');

// Load Passport Config 
// Go to the file here and look! There's a parameter where we expect it to grab the module!
require('./config/passport')(passport); //the last part is creating instance of. Unfamiliar...
//Hm... I think the (passport) here is taking from the const from above. You're passing it into require. STRANGE.
const db = require('./config/database');


// Map global promise - get rid of warning
mongoose.Promise = global.Promise;
// Connect to mongoose
mongoose.connect(db.mongoURI, {
  useMongoClient: true
})
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

// Handlebars Middleware
app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Static Folder
app.use(express.static(path.join(__dirname, 'public'))); //this here sets the public folder to be the static express folder

// Method override middleware
app.use(methodOverride('_method'));

// Express session midleware
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

// Passport middlewares... important that this comes after app.use(sesison)
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

// Global variables--When you're logged in, you have access to the object User
app.use(function(req, res, next){
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null; //req.user will only be there if we're logged in, or else nada.
  next();
});

// Index Route
app.get('/', (req, res) => {
  const title = 'Welcome to Coding Log MVP';
  res.render('index', {
    title: title
  });
});

// About Route
app.get('/about', (req, res) => {
  res.render('about');
});


// Use routes (difference btween this and load routes?)
app.use('/timeCoded', timeCoded); // meaning you can do /rawr/whatever ideas.js route set up. 
//http://localhost:5000/rawr/add would work lol
app.use('/users', users);

const port = process.env.PORT || 5000; //because we're working with Heroku, either it assigns it or 5000

app.listen(port, () =>{
  console.log(`Server started on port ${port}`);
});