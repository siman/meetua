'use strict';

var _ = require("underscore");
var Event = require('../../models/Event');
var EventStore = require("../event/EventStore");

// TODO: Limit to last 5 events if this is an overview of events in user's profile.

module.exports.get_my = function(req, res, next) {
  var type = req.query.type;
  var query = {};
  if (type == 'going') {
    query = {participants: req.user._id, 'start.date': {$gt: Date.now()}};
  } else if (type == 'visited') {
    // TODO: Check also end date that it is <= now.
    query = {participants: req.user._id, 'start.date': {$lte: Date.now()}};
  } else {
    // type=created by me
    query = {author: req.user._id};
  }
  Event.find(query, function(err, events) {
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

    function updateEvent(status) {
      event.save(function(err) {
        if (err) return next(err);
        res.json({status: status});
      });
    }

    var alreadyPartInx = event.participants.indexOf(curUser._id);
    if (act === 'remove' && alreadyPartInx >= 0) {
//      console.log("remove");
      event.participants.splice(alreadyPartInx, 1);
      updateEvent('removed');
    } else if (act === 'add' && alreadyPartInx < 0) {
//      console.log("add");
      event.participants.push(curUser._id);
      updateEvent('added');
    } else {
//      console.log("else");
      res.json({status: 'added'});
    }
  });
};