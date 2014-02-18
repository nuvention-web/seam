var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var memberSchema = new Schema({
	name: { type: String },
	email: { type: String },
});

var projectSchema = new Schema({
    name: { type: String, required: true, index: { unique: true } },
    groupMembers: [memberSchema]
});

module.exports = mongoose.model('Project', projectSchema);