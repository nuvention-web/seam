var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var noteSchema = new Schema({
	notes: { type: String }
});

var attendeeSchema = new Schema({
	attendeeName: { type: String },
	attendeeEmail: { type: String }
});

var topicSchema = new Schema({
	topic: { type: String },
	notes: [noteSchema],
	duration: { type: String }
});

var meetingSchema = new Schema({
	UserId: { type: String, required : true},
	meetingTitle: { type: String },
	location: { type: String },
	objective: { type: String },
	duration: {type: Number},
	meetingTime: { type: Date },
	meetingDate: {type: String},
	attendees: [attendeeSchema],
	agenda: [topicSchema],
	timerInfo: { type:String },
    isComplete: { type: Number, default: 0} // 0 is no, 1 is yes
})

module.exports = mongoose.model('Meeting', meetingSchema);