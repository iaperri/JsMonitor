// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var healthStateSchema = new Schema({
  problemNumber: String,
  first: Date,
  last: Date,
  logFile: String
});

var playerHealthStateSchema = new Schema({
  unitId: String,
  healthState: [healthStateSchema]
});