var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var user = new Schema({
  username: String,
  password: String,
  authorized: {type: Boolean, default: false}
});

module.exports = mongoose.model('users', user);
