'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Image = require('./Image');
var moment = require('moment');

var eventSchema = new mongoose.Schema({
    name: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    description: { type: String, required: true, trim: true },
    activity: { type: String, required: true, default: 'other' },
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

eventSchema.virtual('prettyStartDate').get(function(){
  return moment(this.start.date).format('dddd Do MMMM HH:mm')
});
eventSchema.set('toJSON', {virtuals: true });

module.exports = mongoose.model('Event', eventSchema);