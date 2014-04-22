/**
 * Created by Alex on 4/23/14.
 */

var _ = require("underscore");
var Event = require('../../models/Event');

// TODO: Limit to last 5 events if this is an overview of events in user's profile.

module.exports.get_my = function(req, res, next) {
  Event.find({author: req.user._id}, function(err, events) {
    if (err) return next(err);
    res.json(events);
  });
};