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
  isGenerated: { type: Boolean, default: false },
  isBlocked: {type: Boolean, default: false},

  // TODO: by Siman: Add fields: 'createdOn', 'updatedOn'

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
    longitude: Number,
    placeId: String,
    city: String
  },
  start: {
    dateTime: { type: Date, require: true }
  },
  end: {
    dateTime: Date
  },
  price: {
    amount: Number,
    currency: String
  },
  canceledOn: { type: Date },
  images: [Image.schema] // default order, logo first TODO
});

eventSchema.virtual('googleMapsUrl').get(function() {
  var coords = '' + this.place.latitude + ',' + this.place.longitude;
  return 'https://www.google.com/maps/place/' + coords + '/@' + coords + ',16z';
});

eventSchema.virtual('logoUrl').get(function() {
  var logo = findLogo(this.images);
  return logo ? logo.url : null;
});

eventSchema.virtual('logoThumbnailUrl').get(function() {
  var logo = findLogo(this.images);
  return logo ? logo.thumbnailUrl : null;
});

function findLogo(images) {
  return _.find(images, function(img) { return img.isLogo; });
}

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

eventSchema.virtual('isFree').get(function() {
  return !(this.price.amount && this.price.amount > 0);
});


eventSchema.set('toJSON', {virtuals: true });

eventSchema.pre('save', true, function sanitizeDescription(next, done) {
  next();
  this.description = sanitizeHtml(this.description, {
    allowedTags: [ 'blockquote', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'b', 'i', 'strong', 'ul', 'ol', 'li',
      'img', 'br', 'span', 'div'/*enter*/, 'a', 'iframe'/*video*/ ],
    allowedAttributes: {
      a: [ 'href', 'name', 'target' ],
      p: [ 'style' ],
      span: [ 'style' ],
      img: [ 'src', 'style', 'alt', 'title', 'data-filename' ],
      iframe: [ 'src', 'width', 'height', 'frameborder']
    },
    allowedSchemes: [ 'data', 'http', 'https' ] /*data for <img src='data:...'/>*/
  });
  done();
});

module.exports = mongoose.model('Event', eventSchema);