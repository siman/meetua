'use strict';

var store = require("./EventStore");
var _ = require("underscore");
var config = require('../../config/app-config');

module.exports = function(req, res) {
  var id = req.params.id;
  store.findById(id, ["author", "profile.name profile.picture"], function(err, event) {
    if (err) console.log('Error while looking for event by ID', err);
    console.log("id", id);
    console.log("found event", event);
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
        event: event,
        social: social,
        // If current user is an author of event
        isCurrentUserAnAuthor: event.author && req.user && event.author._id.equals(req.user._id)
      });
    }
  });
};
