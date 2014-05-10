'use strict';

var _ = require('underscore');
var async = require('async');
var conf = require('../../config/app-config');
var Event = require('../../models/Event');
var EventStore = require('../event/EventStore');
var Notifier = require('../util/notificationService');

// TODO: Limit to last 5 events if this is an overview of events in user's profile.

/** Build Mongo filters for different event types: my , going, visited. */
var buildMyFilters = function(req) {
  var curUserId = req.user._id;
  var now = Date.now();
  return {
    my: {author: curUserId},
    going: {participants: curUserId, 'start.date': {$gt: now}},
    visited: {participants: curUserId, 'start.date': {$lte: now}}
  };
};

/** Returns all my events of certain type: my, going, visited. */
module.exports.get_my = function(req, res, next) {
  var eventType = req.query.type || 'my';
  var filter = buildMyFilters(req)[eventType];
  // TODO: Add pagination
  Event.find(filter).sort({'start.date': 1}).exec(function(err, events) {
    if (err) return next(err);
    res.json(events);
  });
};

/** Returns short overview of all user's events: my + going + visited. */
module.exports.get_myOverview = function(req, res, next) {
  var filters = buildMyFilters(req);
  async.parallel(
    {
      my: function(cb) {
        // Created by me
        findMyEvents(filters.my, cb);
      },
      going: function(cb) {
        findMyEvents(filters.going, cb);
      },
      visited: function(cb) {
        // TODO: Check also end date that it is <= now.
        findMyEvents(filters.visited, cb);
      }
    },
    function(err, events) {
      if (err) return next(err);
      res.json(events);
    });

  function findMyEvents(query, cb) {
    Event.find(query)
      .sort({'start.date': 1})
      .limit(conf.MAX_EVENTS_IN_OVERVIEW)
      .exec(cb);
  }
};

module.exports.get_findById = function(req, res, next) {
  var id = req.query.id;
  console.log("id", id);
  if (id) {
    EventStore.findById(id, function(err, event) {
      if (err) return next(err);
      res.json({event: event});
    });
  } else {
    res.send(404);
  }
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

/** Change participation status for event. */
module.exports.post_participation = function(req, res, next) {
  var eventId = req.query.eventId;
  var act = req.query.act || 'add'; // valid values: add, remove.
  var curUser = req.user;

  EventStore.findById(eventId, function(err, event) {
    if (err) next(err);

    function updateEvent(status) {
      event.save(function(err) {
        if (err) return next(err);


        if (status == 'added') Notifier.notifyParticipant(curUser, event);
        res.json({status: status})
      });
    }

    // TODO: Disallow to change participation if event is int the past?

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