'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Image = require('./Image');
var moment = require('moment');
var _ = require('underscore');
var path = require('path');
var activities = require('../../public/js/app/shared/services/constants').activities;
var logger = require('../controllers/util/logger')('Event.js');
var appConfig = require('../../config/app-config');

var activityNames = _.map(activities, function(activity) {
  return activity.name;
});

var eventSchema = new mongoose.Schema({
    name: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
    description: { type: String, required: true, trim: true },
    activity: { type: String, required: true, default: 'other', enum: activityNames },
    place: {
        name: { type: String, required: true, trim: true },
        latitude: Number,
        longitude: Number
    },
    start: {
        dateTime: { type: Date, require: true }
    },
    end: {
        dateTime: Date
    },
    canceledOn: { type: Date },
    images: [Image.schema] // default order, logo first TODO
});

eventSchema.virtual('prettyStartDate').get(function() {
  return moment(this.start.dateTime).format('dddd Do MMMM HH:mm');
});

eventSchema.virtual('logoUrl').get(function() {
  var logo = _.find(this.images, function(img) { return img.isLogo; });
  logger.debug("Found logo", logo);
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
  return moment(this.start.dateTime).isBefore(moment());
});

eventSchema.set('toJSON', {virtuals: true });

eventSchema.methods.url = function() {
  return appConfig.hostname + '/event/' + this._id;
};

module.exports = mongoose.model('Event', eventSchema);