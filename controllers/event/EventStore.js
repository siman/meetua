var _ = require("underscore");
var mockEvents = require("./MockEvents");
var Event = require('../../models/Event');

// TODO: Replace mock events by MongoDB.
// TODO: Order by 'startDate asc' to show most recent events.

module.exports.dbPreload = function() {
  console.log("Preloading database...");
  Event.find({}, function(err, events) {
    if (events.length > 0) return;

    _.map(mockEvents, function(ev) {
      var newEvent = new Event(ev);
      newEvent.save(function(err) {
        if (err != null) console.error("cound not save mocked Events: " + err)
      })
    });
  })
};

module.exports.findByAuthor = function () {
  // TODO
};

module.exports.findAll = function (cb) {
  return Event.find({}, function (err, events) {
    cb(err, events);
  });
};

module.exports.findByActivity = function(act, cb) {
  return Event.find({'activity': act}, function(err, events) {
    cb(err, events);
  });
};

module.exports.findById = function(id, cb) {
  return Event.findOne({'_id': id}, function(err, event) {
    cb(err, event);
  });
};