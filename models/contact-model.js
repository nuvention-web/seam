var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var memberSchema= new Schema({
	memberName: { type: String },
	memberEmail: { type: String }
});

var contactSchema = new Schema({
	UserId: { type: String, required : true},
	contacts: [memberSchema]
});

module.exports = mongoose.model('Contact', contactSchema);