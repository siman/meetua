/**
 * Created by Alex on 4/23/14.
 */

var _ = require("underscore");
var Event = require('../../models/Event');
var EventStore = require("../event/EventStore");

// TODO: Limit to last 5 events if this is an overview of events in user's profile.

module.exports.get_my = function(req, res, next) {
  Event.find({author: req.user._id}, function(err, events) {
    if (err) return next(err);
    res.json(events);
  });
};

module.exports.get_find = function(req, res, next) {
  var activity = req.query.act;
  console.log("act", activity);
  function onFoundEvents(err, events) {
    if (err) return next(err);
    res.json(events);
  }
  if (activity) {
    EventStore.findByActivity(activity, onFoundEvents);
  } else {
    EventStore.findAll(onFoundEvents);
  }
};