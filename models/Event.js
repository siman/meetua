var mongoose = require('mongoose');
var Image = require('./Image');

var eventSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true, trim: true },
    activity: String,
    place: {
        name: { type: String, required: true, trim: true },
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true }
    },
    start: {
        date: { type: Date, required: true },
        time: { type: Date }
    },
    end: {
        date: Date,
        time: Date
    },
    images: [Image.schema]
});

module.exports = mongoose.model('Event', eventSchema);