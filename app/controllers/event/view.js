'use strict';

var Event = require('../../models/Event');
var _ = require("underscore");
var config = require('../../../config/app-config');
var logger = require('../util/logger')(__filename);

module.exports = function(req, res, next) {
  var id = req.params.id;
  Event.findOne({_id: id}, function(err, event) {
    if (err) {
      logger.error('Error while looking for event by ID', err);
      return next(err);
    }
    logger.debug("id", id);
    logger.debug("found event", event);
    if (!event) {
      res.renderNotFound();
    } else {
      var fullUrl = config.hostname + req.originalUrl;
      var tweet = (event.name + config.socialTweetLinkLength > 139 ? event.name.substring(0, (139 - config.socialTweetLinkLength)) : event.name);
      var social = {
        path: fullUrl,
        tweet: tweet
      };
      res.render('event/view', {
        title: event.name,
        event: event,
        social: social
      });
    }
  }).populate('author participants.user');
};
