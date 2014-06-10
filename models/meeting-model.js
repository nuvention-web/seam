var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var noteSchema = new Schema({
	notes: { type: String }
});

var attendeeSchema = new Schema({
	attendeeName: { type: String },
	attendeeEmail: { type: String },
	isPresent: { type: Number, default: 1} // 0 is no, 1 is yes
});

var taskSchema = new Schema({
	assigneeName: { type: String },
	task: { type: String },
	taskDueDate: { type: String } 
});

var topicSchema = new Schema({
	topic: { type: String },
	notes: [noteSchema],
	tasks: [taskSchema],
	duration: { type: String },
	timeLeft: {type: Number, default: 0}
});

var meetingSchema = new Schema({
	dateCreated: { type: Date, default: Date.now },
	UserId: { type: String, required : true},
	meetingTitle: { type: String },
	location: { type: String },
	objective: { type: String },
	duration: {type: String},
	meetingTime: { type: Number },
	meetingDate: {type: Date},
	attendees: [attendeeSchema],
	agenda: [topicSchema],
	timerInfo: { type:String },
    isComplete: { type: Number, default: 0}, // 0 is no, 1 is yes
    currentTime: {type: Number} //might need to use this to keep track of time
})

module.exports = mongoose.model('Meeting', meetingSchema);