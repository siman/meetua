var
  _ = require("underscore")
  , events = require("./MockEvents");

// TODO: Replace mock events by MongoDB.
// TODO: Order by 'startDate asc' to show most recent events.

module.exports.findAll = function() {
  return events;
};

module.exports.findByActivity = function(act) {
  return _.filter(events, function(e) { return e.activity === act; });
};

module.exports.findById = function(id) {
  return _.findWhere(events, {id: id});
};