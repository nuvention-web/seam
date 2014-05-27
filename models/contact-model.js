var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var contactSchema = new Schema({
	UserId: { type: String, required : true},
	contacts: [memberSchema]
});

var memberSchema= new Schema({
	memberName: { type: String },
	memberEmail: { type: String }
})

module.exports = mongoose.model('Contact', contactSchema);