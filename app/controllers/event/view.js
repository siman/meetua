'use strict';

var Event = require('../../models/Event');
var _ = require("underscore");
var config = require('../../../config/app-config');
var logger = require('../util/logger')('view.js');

module.exports = function(req, res) {
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
      var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
      var tweet = (event.name + config.socialTweetLinkLength > 139 ? event.name.substring(0, (139 - config.socialTweetLinkLength)) : event.name);
      var social = {
        path: fullUrl,
        tweet: tweet
      };
      res.render('event/view', {
        title: event.name,
        event: event,
        social: social,
        // If current user is an author of event
        isCurrentUserAnAuthor: event.author && req.user && event.author._id.equals(req.user._id)
      });
    }
  }).populate(["author", "profile.name profile.picture", "participants"]);
};
