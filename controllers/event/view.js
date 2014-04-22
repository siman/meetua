var
  store = require("./EventStore")
  , _ = require("underscore")
  ;

module.exports = function(req, res) {
  var id = req.params.id;
  store.findById(id, function(err, event) {
    if (err) console.log('Error while quering by event id' + err);
    console.log("id", id);
    console.log("found event", event);
    res.render('event/view', {event: event});
  });


//  if (_.isUndefined(event)) {
//    res.status(404);
//  }
//  res.render('event/view', {event: event});
};
