var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var taskSchema = new Schema({
	ProjectId: { type: String, required : true},
	UserId: { type: String, required : true},
	MeetingId: {type: String},
    meetingTask: { type: String },
    meetingDate: { type: String },
    meetingPerson: { type: String },
    isComplete: { type: Number, default: 0} // 0 is no, 1 is yes
});

module.exports = mongoose.model('Task', taskSchema);