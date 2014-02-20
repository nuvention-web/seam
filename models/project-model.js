var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var memberSchema = new Schema({
	memberName: { type: String },
	memberEmail: { type: String },
});

var projectSchema = new Schema({
	UserId : { type: String, required: true},
    projectName: { type: String, required: true},
    groupMembers: [memberSchema]
});

module.exports = mongoose.model('Project', projectSchema);