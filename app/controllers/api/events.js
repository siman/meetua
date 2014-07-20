'use strict';

var _ = require('underscore');
var async = require('async');
var conf = require('../../../config/app-config');
var Event = require('../../models/Event');
var EventStore = require('../event/EventStore');
var Notifier = require('../util/notification-service');
var logger = require('../util/logger')('event.js');

// TODO: Limit to last 5 events if this is an overview of events in user's profile. issue #169

/**
 * Build Mongo filters for different event types: my , going, visited, canceled.
 */
var buildUserEventsFilters = function(userId) {
  var now = Date.now();
  return {
    my: {author: userId, canceledOn: {$exists: false}},
    myCanceled: {author: userId, canceledOn: {$exists: true}},
    going: {participants: userId, 'start.dateTime': {$gt: now}, canceledOn: {$exists: false}},
    visited: {participants: userId, 'start.dateTime': {$lte: now}, canceledOn: {$exists: false}}
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

module.exports.get_findById = function(req, res, next) {
  var id = req.query.id;
  logger.debug("id", id);
  if (id) {
    EventStore.findById(id, ["participants"], function(err, event) {
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
  logger.debug('post_participation eventId: ' + eventId + ' act ' + act + ' curUser ' + curUser);

  EventStore.findById(eventId, [], function(err, event) {
    logger.debug('event found result: err ' + err + ' event ' + event);
    if (err) {
        return next(err);
    }

    function updateEvent(status) {
      event.save(function(err) {
        logger.debug('event save result: err ' + err);
        if (err) return next(err);

        if (status == 'added') {
            Notifier.notifyParticipantOnJoin(curUser, event, function sendResponse(err) {
              if (err) {
                  logger.debug('notify result: err', err);
                  return res.json(500, 'Не удалось отправить уведомление Вам на почту.');
              }
              return res.json({status: status})
            });
        } else {
            res.json({status: status});
        }
      });
    }

    // TODO: Disallow to change participation if event is int the past? issue #168

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