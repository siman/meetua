var
  store = require("./EventStore")
  , _ = require("underscore")
  ;

module.exports = function(req, res) {
  var id = req.params.id;
  var event = store.findById(id);

  console.log("id", id);
  console.log("found event", event);

  if (_.isUndefined(event)) {
    res.status(404);
  }
  res.render('event/view', {event: event});
};
