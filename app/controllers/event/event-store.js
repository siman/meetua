'use strict';

var _ = require("underscore");
var async = require("async");
var mockEvents = require("./mock-events");
var Event = require('../../models/Event');
var util = require('../util/utils');
var moment = require('moment');
var logger = require('../util/logger')(__filename);

// TODO: Order by 'startDate asc' to show most recent events.

module.exports.dbPreload = util.dbPreload({
  count: Event.count.bind(Event),
  mockEntities: mockEvents,
  entityConstructor: Event,
  entityName: "Event"
});

module.exports.findComingSoon = function (cb) {
  var todayEndOfDay = moment().endOf('day').toDate();
  var tomorrowEndOfDay = moment().endOf('day').add('days', 1).toDate();

  return findEvents({'start.dateTime': {'$gte': todayEndOfDay, '$lt': tomorrowEndOfDay}, canceledOn: {$exists: false}},
    ['author', 'participants.user'], cb)
};

module.exports.findById = function(id, population, cb) {
  return findSingleEvent(id, population, cb, false)
};

module.exports.findCanceledById = function(id, population, cb) {
  return findSingleEvent(id, population, cb, true)
};

function findSingleEvent(id, population, cb, isCanceled) {
  var filter = {_id: id,
         canceledOn: {$exists: isCanceled}};
  return findEvents(filter, population, function(err, events) {
    var event = events && events[0];
    cb(err, event);
  });
}

/**
 * @deprecated
 */
function findEvents(findQuery, populationList, cb) {
  logger.debug('findEvents() query:', findQuery, 'populate:', populationList);
  return Event.find(findQuery)
    .populate(populationList)
    .exec(cb);
}