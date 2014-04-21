var
  _ = require("underscore")
  , events = require("./MockEvents");
var Event = require('../../models/Event');

// TODO implement other methods using mongoose API
// TODO: Order by 'startDate asc' to show most recent events.

module.exports.findByAuthor = function() {
    // TODO
};

module.exports.findAll = function(cb) {
  return Event.find({}, function(err, events) {
      cb(err, events);
  });
};

module.exports.findByActivity = function(act) {
  return _.filter(events, function(e) { return e.activity === act; });
};

module.exports.findById = function(id) {
  return _.findWhere(events, {id: id});
};