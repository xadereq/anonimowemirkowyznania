var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var confessionSchema = new Schema({
    text: String,
    embed: String,
    auth: String,
    entryID: Number,
    accepted: {type: Boolean, default: false},
    addedBy: String,
    notificationCommentId: Number,
});

module.exports = mongoose.model('confessions', confessionSchema);
