var store = require("./EventStore");
var _ = require("underscore");

module.exports = function(req, res, next) {
  var activity = req.query.act;
  console.log("act", activity);
  function onFoundEvents(err, events) {
    if (err) return next(err);
    res.json(events);
  }
  if (activity) {
    store.findByActivity(activity, onFoundEvents);
  } else {
    store.findAll(onFoundEvents);
  }
};
