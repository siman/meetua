'use strict';

var _ = require('underscore');
var async = require('async');
var conf = require('../../config/app-config');
var Event = require('../../models/Event');
var EventStore = require('../event/EventStore');
var Notifier = require('../util/notification-service');
var logger = require('../util/logger')('event.js');

// TODO: Limit to last 5 events if this is an overview of events in user's profile.

/** Build Mongo filters for different event types: my , going, visited. */
var buildMyFilters = function(req) {
  var curUserId = req.user._id;
  var now = Date.now();
  return {
    my: {author: curUserId, canceledOn: {$exists: false}},
    myCanceled: {author: curUserId, canceledOn: {$exists: true}},
    going: {participants: curUserId, 'start.dateTime': {$gt: now}, canceledOn: {$exists: false}},
    visited: {participants: curUserId, 'start.dateTime': {$lte: now}, canceledOn: {$exists: false}}
  };
};

/** Returns all my events of certain type: my, going, visited. */
module.exports.get_my = function(req, res, next) {
  var eventType = req.query.type || 'my';
  var filter = buildMyFilters(req)[eventType];
  // TODO: Add pagination
  Event.find(filter).sort({'start.dateTime': 1}).exec(function(err, events) {
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
      },
      myCanceled: function(cb) {
        // Created by me
        findMyEvents(filters.myCanceled, cb);
      }
    },
    function(err, events) {
      if (err) return next(err);
      res.json(events);
    });

  function findMyEvents(filterQuery, cb) {
    var fullQuery = Event.find(filterQuery).sort({'start.dateTime': 1});
    if (conf.MAX_EVENTS_IN_OVERVIEW) {
      fullQuery = fullQuery.limit(conf.MAX_EVENTS_IN_OVERVIEW);
    }
    fullQuery.exec(cb);
  }
};

module.exports.get_findById = function(req, res, next) {
  var id = req.query.id;
  logger.debug("id", id);
  if (id) {
    EventStore.findById(id, [], function(err, event) {
      if (err) return next(err);
      res.json({event: event});
    });
  } else {
    res.send(404);
  }
};

module.exports.get_find = function(req, res, next) {
  var activity = req.query.act;
  logger.debug("act", activity);
  var filter = {
    'start.dateTime': {$gt:  Date.now()},
    canceledOn: {$exists: false}
  };
  if (activity) {
    filter.activity = activity;
  }
  return Event.find(filter).exec(function(err, events) {
    if (err) return next(err);
    res.json(events);
  });
};

/** Change participation status for event. */
module.exports.post_participation = function(req, res, next) {
  var eventId = req.query.eventId;
  var act = req.query.act || 'add'; // valid values: add, remove.
  var curUser = req.user;

  EventStore.findById(eventId, [], function(err, event) {
    if (err) next(err);

    function updateEvent(status) {
      event.save(function(err) {
        if (err) return next(err);


        if (status == 'added') Notifier.notifyParticipantOnJoin(curUser, event, function sendResponse(err) {
          if (err) return res.json(500, err);
          res.json({status: status})
        });
      });
    }

    // TODO: Disallow to change participation if event is int the past?

    var alreadyPartInx = event.participants.indexOf(curUser._id);
    if (act === 'remove' && alreadyPartInx >= 0) {
//      logger.debug("remove");
      event.participants.splice(alreadyPartInx, 1);
      updateEvent('removed');
    } else if (act === 'add' && alreadyPartInx < 0) {
//      logger.debug("add");
      event.participants.push(curUser._id);
      updateEvent('added');
    } else {
//      logger.debug("else");
      res.json({status: 'added'});
    }
  });
};

// TODO: Move to /api/meetua/account/notifications
module.exports.post_notifications = function(req, res, next) {
  var newEmail = req.query.email;
  var curUser = req.user;

  if (curUser.email) {
    res.json(304, 'User has already specified email'); // user's email was not modified.
  } else {
    User.findById(curUser._id, function(err, freshUser) {
      if (err) return res.json(500, 'Could not find current user');
      freshUser.email = newEmail;
      freshUser.save(function(err) {
        if (err) return res.json(500, 'Failed to update current user');
        res.json('Email updated');
      });
    });
  }
};

module.exports.post_notify = function(req, res, next) {
  var act = req.query.act;
  var eventId = req.query.eventId;
  var curUser = req.user;

  if (act === 'participate') {
    EventStore.findById(eventId, [], function(err, event) {
      if (err) return res.send(404);
      Notifier.notifyParticipantOnJoin(curUser, event);
      res.json('Notification was sent');
    });
  } else {
    res.json(400, 'Unknown act was specified:', act);
  }
};