'use strict';

var store = require("./EventStore");
var _ = require("underscore");

module.exports = function(req, res) {
  var id = req.params.id;
  store.findById(id, function(err, event) {
    if (err) console.log('Error while looking for event by ID', err);
    console.log("id", id);
    console.log("found event", event);
    if (!event) {
      res.status(404);
      res.render("404");
    } else {
      res.render('event/view', {
        event: event,
        // If current user is an author of event
        isCurrentUserAnAuthor: event.author && req.user && event.author._id.equals(req.user._id)
      });
    }
  });
};
