var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var replySchema = new Schema({
    text: String,
    alias: String,
    embed: String,
    auth: String,
    authorized: {type: Boolean, default: false},
    parentID:  { type: Schema.Types.ObjectId, ref: 'confessions' },
    commentID: Number,
    accepted: {type: Boolean, default: false},
    addedBy: String
});

module.exports = mongoose.model('replies', replySchema);
