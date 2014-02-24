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
	ProjectId: { type: String, required : true},
	UserId: { type: String, required : true},
	meetingTitle: { type: String },
	objective: { type: String },
	meetingTime: { type: String },
	meetingDate:{type:String},
	meetingMembers:{type:String},
	agenda: [topicSchema],
	timerInfo: {type:String},
    isComplete: { type: Number, default: 0} // 0 is no, 1 is yes
})

module.exports = mongoose.model('Meeting', meetingSchema);