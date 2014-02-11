var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var surveySchema = new Schema({
    firstName: { type: String },
    lastName: { type: String },
    industry: { type: String },
    func: { type: String },
    meetingFrequency:{ type: String },
    frustration: { type: String },	
    dateInserted: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Survey', surveySchema);