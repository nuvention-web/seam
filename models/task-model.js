var mongoose = require('mongoose');
var Schema = mongoose.Schema;

taskSchema = new Schema({
    meetingTask: { type: String },
    meetingDate: { type: String },
    meetingPerson: { type: String }
});

module.exports = mongoose.model('Task', taskSchema);