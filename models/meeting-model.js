var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var noteSchema = new Schema({
	notes: { type: String }
});

var topicSchema = new Schema({
	topic: { type: String },
	notes: [noteSchema],
	duration: { type: String }
});

var meetingSchema = new Schema({
	UserId: { type: String, required : true},
	meetingTitle: { type: String },
	objective: { type: String },
	meetingTime: { type: String },
	agenda: [topicSchema],
    isComplete: { type: Number, default: 0} // 0 is no, 1 is yes
})

module.exports = mongoose.model('Meeting', meetingSchema);