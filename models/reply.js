var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var replySchema = new Schema({
    text: String,
    alias: String,
    embed: String,
    auth: String,
    parentID: Number,
    commentID: Number,
    accepted: {type: Boolean, default: false}
});

module.exports = mongoose.model('replies', replySchema);
