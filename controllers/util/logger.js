var winston = require('winston');
var path = require('path');
var fs = require('fs-extra');
var config = require('../../config/app-config');
var logDir = path.join(config.PERSISTENT_DATA_DIR, config.LOG_DIR_NAME);

fs.ensureDir(logDir, function(err) {
  logger.debug(err);
});

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({timestamp: true, level: 'debug'}),
    new (winston.transports.DailyRotateFile)({
      filename: logDir + '/' + config.LOG_FILE_NAME,
      datePattern: '.yyyy-MM-dd',
      level: 'debug',
      json: false
    })
  ]
});

module.exports = function (module) {

  var filename = module;
  return {
    debug : function (msg, vars) {
      logger.debug('[' + filename + ']' + getMsg(arguments));
    },
    info : function (msg, vars) {
      logger.debug('[' + filename + ']' + getMsg(arguments));
    },
    warn : function (msg, vars) {
      logger.warn('[' + filename + ']' + getMsg(arguments));
    },
    error : function (msg, vars) {
      logger.error('[' + filename + ']' + getMsg(arguments));
    }
  }
};

function getMsg(args) {
  var msg = "";
  for (var i = 0; i < args.length; i++) {
    msg = msg + " " + args[i]
  }
  return msg;
}
