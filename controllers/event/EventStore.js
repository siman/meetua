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
      var newEvent = new Event(ev)
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

module.exports.findByActivity = function(act) {
  return _.filter(mockEvents, function(e) { return e.activity === act; });
};

module.exports.findById = function(id) {
  return _.findWhere(mockEvents, {id: id});
};