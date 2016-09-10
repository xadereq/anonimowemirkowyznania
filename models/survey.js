var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var surveySchema = new Schema({
    question: String,
    answers: []
});

module.exports = mongoose.model('surveys', surveySchema);
