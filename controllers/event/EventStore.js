var _ = require("underscore");
var async = require("async");
var mockEvents = require("./MockEvents");
var Event = require('../../models/Event');

// TODO: Order by 'startDate asc' to show most recent events.

module.exports.dbPreload = function() {
  Event.count(function(err, eventSize) {
    if (eventSize > 0) {
      console.log("Found", eventSize, "events in MongoDB. Preloading is not required");
    } else {
      console.log("Preloading MongoDB with mocked events...");
      async.reduce(mockEvents, 0,
        function(savedSize, mockEvent, callback) {
          var newEvent = new Event(mockEvent);
          newEvent.save(function(err, savedEvent) {
            if (err) {
              console.error("Failed to save mocked event", err);
            } else {
              savedSize++;
            }
            callback(null, savedSize);
          })
        }, function(err, savedSize) {
          console.log("MongoDB has been preloaded with", savedSize, "out of", mockEvents.length, "events");
        }
      );
    }
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
  return Event.findById(id, function(err, event) {
    cb(err, event);
  });
};