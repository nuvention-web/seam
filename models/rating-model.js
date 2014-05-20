var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var rateSchema = new Schema({
	userId: { type: String },
	name: { type: String },
    rating: { type: String }
});

var ratingSchema = new Schema({
	meetingId: { type: String },
	ratings: [rateSchema]
});

module.exports = mongoose.model('Rating', ratingSchema);