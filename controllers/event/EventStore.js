'use strict';

var _ = require("underscore");
var async = require("async");
var mockEvents = require("./MockEvents");
var Event = require('../../models/Event');
var util = require('../util');
var moment = require('moment');

// TODO: Order by 'startDate asc' to show most recent events.

// TODO: Preload test users: author of events, participants, etc.

module.exports.dbPreload = util.dbPreload({
  count: Event.count.bind(Event),
  mockEntities: mockEvents,
  entityConstructor: Event,
  entityName: "Event"
});

module.exports.findByAuthor = function () {
  // TODO
};

module.exports.findCommingSoon = function (cb) {
  var todayEndOfDay = moment().endOf('day').toDate();
  var tomorrowEndOfDay = moment().endOf('day').add('days', 1).toDate();

  return findEvents({'start.date': {'$gte': todayEndOfDay, '$lt':tomorrowEndOfDay}}, ['participants'], cb)
};

module.exports.findAll = function (cb) {
  return findEvents({}, [], cb);
};

module.exports.findByActivity = function(act, cb) {
  return findEvents({activity: act}, [], cb);
};

module.exports.findById = function(id, cb) {
  return findEvents({_id: id}, ["author", "profile.name profile.picture"], function(err, events) {
    cb(err, events[0]);
  });
};

function findEvents(findQuery, populationList, cb) {
  return Event.find(findQuery)
    .populate(populationList)
    .exec(cb);
}