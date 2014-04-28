'use strict';

var store = require("./EventStore");
var _ = require("underscore");

module.exports = function(req, res) {
  var id = req.params.id;
  store.findById(id, function(err, event) {
    if (err) console.log('Error while quering by event id', err);
    console.log("id", id);
    console.log("found event", event);
    if (!event) {
      res.status(404);
      res.render("404");
    } else {
      res.render('event/view', {event: event});
    }
  });
};
