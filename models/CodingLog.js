const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const CodingLogSchema = new Schema({
  goal:{
    type: String,
    required: true
  },
  timeCoded:{
    type: Number,
    required: true
  },
  user: {
    type: String,
    require: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

mongoose.model('timeCoded', CodingLogSchema);