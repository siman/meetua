var logger = require('./logger')('error-handler.js');
var notificationService = require('./notification-service');

exports.errorGenerator = function(req, res, next){
  var err = new Error('database connection failed');
  next(err);
};

exports.error = function(err, req, res, next) {
  logger.error(err.stack);
  var msg = 'Internal server error';

  notificationService.notifySupport(err.stack, function() {
    res.format({
      html: function () {
        res.render('5xx');
      },

      json: function () {
        res.send({ error: msg });
      },

      text: function () {
        res.send(msg + '\n');
      }
    });
  });



};