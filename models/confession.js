var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var confessionSchema = new Schema({
    text: String,
    embed: String,
    auth: String,
    tags: [],
    entryID: Number,
    status: {type: Number, default: 0},
    addedBy: String,
    notificationCommentId: Number,
    IPAdress: String,
    actions: [{type: Schema.Types.ObjectId, ref: 'actions'}],
    conversations: [{type: Schema.Types.ObjectId, ref: 'conversations'}]
});

module.exports = mongoose.model('confessions', confessionSchema);
