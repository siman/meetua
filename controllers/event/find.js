var
  store = require("./EventStore")
  , _ = require("underscore")
  ;

module.exports = function(req, res, next) {
  var activity = req.query.act;
  console.log("act", activity);
    if (activity) {
        res.json(store.findByActivity(activity));
    } else {
        store.findAll(function(err, events) {
            if (err) return next(err);
            res.json(events);
        });
    }
};
