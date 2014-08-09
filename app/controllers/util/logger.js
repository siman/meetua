'use strict';

var winston = require('winston');
var path = require('path');
var fs = require('fs-extra');
var moment = require('moment');
var config = require('../../../config/app-config');
var logDir = path.join(config.PERSISTENT_DATA_DIR, config.LOG_DIR_NAME);

fs.ensureDir(logDir, function(err) {
  logger.debug(err);
});

winston.addColors({
  debug: 'cyan' // Override dark blue by sky blue of cyan.
});

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      timestamp: function() {
        return moment().format('HH:mm:ss.SSS');
      },
      level: 'debug',
      colorize: 'true'
    }),
    new (winston.transports.DailyRotateFile)({
      filename: logDir + '/' + config.LOG_FILE_NAME,
      datePattern: '.yyyy-MM-dd',
      level: 'debug',
      json: false
    })
  ]
});

module.exports = function(module) {
  var loggerName = path.basename(module);

  function buildMsg(args) {
    var msg = '[' + loggerName + ']';
    for (var i = 0; i < args.length; i++) {
      msg = msg + ' ' + args[i];
    }
    return msg;
  }

  function buildLogger(loggerFunc) {
    return function() {
      loggerFunc(buildMsg(arguments));
    };
  }

  return {
    debug: buildLogger(logger.debug),
    info: buildLogger(logger.info),
    warn: buildLogger(logger.warn),
    error: buildLogger(logger.error)
  }
};
