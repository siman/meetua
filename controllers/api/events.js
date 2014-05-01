'use strict';

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

module.exports.post_participation = function(req, res, next) {
  var eventId = req.query.eventId;
  var act = req.query.act || 'add'; // valid values: add, remove.
  var curUser = req.user;

  EventStore.findById(eventId, function(err, event) {
    if (err) next(err);
    function partEqCurrentUser(partId) {
      // TODO: Fix hack
      // Siman: This is a hack. These two objects are of 2 different types somehow.
      var isEq = partId.toString() == curUser._id.toString();
      return isEq;
    }
    function updateEvent(status) {
      event.save(function(err) {
        if (err) return next(err);
        res.json({status: status});
      });
    }
    var alreadyPart = _.find(event.participants, partEqCurrentUser);
    if (act === 'remove' && alreadyPart) {
//      console.log("remove");
      event.participants = _.reject(event.participants, partEqCurrentUser);
      updateEvent('removed');
    } else if (act === 'add' && !alreadyPart) {
//      console.log("add");
      event.participants.push(curUser._id);
      console.log("updated event 2", event);
      updateEvent('added');
    } else {
//      console.log("else");
      res.json({status: 'added'});
    }
  });
};