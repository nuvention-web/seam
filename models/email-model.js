var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var emailSchema = new Schema({
    email: { type: String, required: true, index: { unique: true } },
    dateInserted: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Email', emailSchema);