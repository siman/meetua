'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Image = require('./Image');
var moment = require('moment');
var _ = require('underscore');
var path = require('path');

var eventSchema = new mongoose.Schema({
    name: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
    description: { type: String, required: true, trim: true },
    activity: { type: String, required: true, default: 'other' },
    place: {
        name: { type: String, required: true, trim: true },
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true }
    },
    start: {
        date: { type: Date, required: true },
        time: Number,
        dateTime: Date
    },
    end: {
        date: Date,
        time: Number,
        dateTime: Date
    },
    images: [Image.schema] // default order, logo first TODO
});

eventSchema.virtual('prettyStartDate').get(function() {
  return moment(this.start.date).format('dddd Do MMMM HH:mm');
});

eventSchema.virtual('logoUrl').get(function() {
  var logo = _.find(this.images, function(img) { return img.isLogo; });
  console.log("Found logo", logo);
  if (logo) {
    return logo.url;
  } else {
    return null;
  }
});

eventSchema.virtual('participantCount').get(function() {
  return this.participants.length;
});

eventSchema.virtual('isPassed').get(function() {
  return moment(this.start.date).isBefore(moment());
});

eventSchema.set('toJSON', {virtuals: true });

eventSchema.pre('save', function(next) {
  if (this.start) {
    this.start.dateTime = mergeDateTime(this.start.date, this.start.time);
  }
  if (this.end) {
    this.end.dateTime = mergeDateTime(this.end.date, this.end.time);
  }
  next();

  function mergeDateTime(date, time) {
    if (date && time) {
      var dateTime = moment(date);
      dateTime.add({ms: time});
      return dateTime.toDate();
    }
  }
});


module.exports = mongoose.model('Event', eventSchema);