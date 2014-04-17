var
  store = require("./EventStore")
  , _ = require("underscore")
  ;

module.exports = function(req, res) {
  var activity = req.query.act;
  console.log("act", activity);
  res.json(
    _.isUndefined(activity)
      ? store.findAll()
      : store.findByActivity(activity)
  );
};
