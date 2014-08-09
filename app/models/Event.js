'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Image = require('./Image');
var moment = require('moment');
var _ = require('underscore');
var path = require('path');
var activities = require('../../public/js/app/shared/services/constants').activities;
var logger = require('../controllers/util/logger')(__filename);
var appConfig = require('../../config/app-config');
var sanitizeHtml = require('sanitize-html');

var activityNames = _.map(activities, function(activity) {
  return activity.name;
});

var eventSchema = new mongoose.Schema({
    name: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    participants: [{
        user: { type: Schema.Types.ObjectId, ref: "User"},
        guests: {type: Number, default: 0}
      }],
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
  if (logo) {
    return logo.url;
  } else {
    return null;
  }
});

eventSchema.virtual('participantCount').get(function() {
  var guestCount = _.reduce(this.participants, function(acc, part) { return acc + part.guests; }, 0);
  return guestCount + this.participants.length;
});

eventSchema.virtual('isPassed').get(function() {
  return moment(this.start.dateTime).isBefore(moment());
});

eventSchema.virtual('url').get(function() {
  return appConfig.hostname + '/event/' + this._id;
});

eventSchema.set('toJSON', {virtuals: true });

eventSchema.pre('save', true, function sanitizeDescription(next, done) {
  next();
  this.description = sanitizeHtml(this.description, {
    allowedTags: [ 'blockquote', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'b', 'i', 'strong', 'ul', 'ol', 'li', 'img', 'br', 'span', 'a' ],
    allowedAttributes: {
      a: [ 'href', 'name', 'target' ],
      p: [ 'style' ],
      span: [ 'style' ]
    }
  });
  done();
});

module.exports = mongoose.model('Event', eventSchema);