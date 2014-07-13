///<reference path='../ts/node/mongoose.d.ts' />
///<reference path='../ts/node/moment.d.ts' />
///<reference path='../ts/node/node.d.ts' />
///<reference path='../ts/node/underscore.d.ts' />

import mongoose = require('mongoose');
import Image = require('./Image');
import _ = require('underscore');
import moment = require('moment');
import path = require('path');
var logger = require('../controllers/util/logger')('Event.js');
var appConfig = require('../config/app-config');

var Schema = mongoose.Schema;

interface Activity {
    name: string;
    textOver: string;
}

var activities: _.List<Activity> = require('../public/js/app/shared/constants').activities;
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
    images: [Image.Img.schema] // default order, logo first TODO
});

eventSchema.virtual('prettyStartDate').get(function() {
    return moment(this.start.dateTime).format('dddd Do MMMM HH:mm');
});

eventSchema.virtual('logoUrl').get(function() {
    var imgs: _.List<Image.iImage> = this.images;
    var logo = _.find(imgs, function(img) { return img.isLogo; });
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
