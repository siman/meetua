var _ = require("underscore");
var async = require("async");
var mockEvents = require("./MockEvents");
var Event = require('../../models/Event');
var util = require('../util');

// TODO: Order by 'startDate asc' to show most recent events.

// TODO: Preload test users: author of events, participants, etc.

module.exports.dbPreload = util.dbPreload({
  count: function(cb) { // I don't know why, but it doesn't work if pass 'Event.count' inline. Maybe 'this' issue.
    Event.count(cb);
  },
  mockEntities: mockEvents,
  entityConstructor: Event,
  entityName: "Event"
});

module.exports.findByAuthor = function () {
  // TODO
};

module.exports.findAll = function (cb) {
  return findEvents({}, cb);
};

module.exports.findByActivity = function(act, cb) {
  return findEvents({activity: act}, cb);
};

module.exports.findById = function(id, cb) {
  return findEvents({_id: id}, cb);
};

function findEvents(findQuery, cb) {
  return Event.find(findQuery).populate("author", "profile.name profile.picture").exec(cb);
}