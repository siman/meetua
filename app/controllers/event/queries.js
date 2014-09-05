'use strict';

var _ = require('underscore');
var async = require('async');
var conf = require('../../../config/app-config');
var Event = require('../../models/Event');
var EventStore = require('./EventStore');
var logger = require('../util/logger')(__filename);

// TODO: Limit to last 5 events if this is an overview of events in user's profile. issue #169

/**
 * Build Mongo filters for different event types: my , going, visited, canceled.
 */
var buildUserEventsFilters = function(userId) {
  var now = Date.now();
  return {
    my: {author: userId, canceledOn: {$exists: false}},
    myCanceled: {author: userId, canceledOn: {$exists: true}},
    going: {'participants.user': userId, 'start.dateTime': {$gt: now}, canceledOn: {$exists: false}},
    visited: {'participants.user': userId, 'start.dateTime': {$lte: now}, canceledOn: {$exists: false}}
  };
};

/** Returns all my events of certain type: my, going, visited. */
module.exports.get_my = function(req, res, next) {
  var eventType = req.query.type || 'my';
  var filter = buildUserEventsFilters(req.user._id)[eventType];
  // TODO: Add pagination. issue #170
  Event.find(filter).sort({'start.dateTime': 1}).exec(function(err, events) {
    if (err) return next(err);
    res.json(events);
  });
};

/** Returns short overview of all user's events: my + going + visited. */
function getUserEventsOverview(userId, cb) {
  var filters = buildUserEventsFilters(userId);
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
        // TODO: Check also end date that it is <= now. issue #171
        findMyEvents(filters.visited, cb);
      },
      myCanceled: function(cb) {
        // Created by me
        findMyEvents(filters.myCanceled, cb);
      }
    }, cb);

  function findMyEvents(filterQuery, cb) {
    var fullQuery = Event.find(filterQuery).sort({'start.dateTime': 1});
    if (conf.MAX_EVENTS_IN_OVERVIEW) {
      fullQuery = fullQuery.limit(conf.MAX_EVENTS_IN_OVERVIEW);
    }
    fullQuery.exec(cb);
  }
}

module.exports.get_myOverview = function(req, res, next) {
  getUserEventsOverview(req.user._id, function(err, events) {
    if (err) return res.json(500, new Error('Не удалось получить данные с сервера'));
    return res.json(events);
  });
};

module.exports.getUserEventsOverview = function(req, res, next) {
  getUserEventsOverview(req.userById._id, function(err, events) {
    if (err) return res.json(500, new Error('Не удалось получить данные с сервера'));
    return res.json(events);
  });
};

module.exports.get_findById = function(req, res, next) {
  var id = req.query.id;
  logger.debug("id", id);
  if (id) {
    EventStore.findById(id, ["participants.user"], function(err, event) {
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

