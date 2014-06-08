var winston = require('winston');

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({timestamp: true, level: 'debug'}),
    new (winston.transports.File)({ filename: 'somefile.log' })
  ]
});

module.exports = function (module) {

  var filename = module;
  return {
    debug : function (msg, vars) {
      logger.debug(filename + ':' + getMsg(arguments));
    },
    info : function (msg, vars) {
      logger.debug(filename + ':' + getMsg(arguments));
    },
    warn : function (msg, vars) {
      logger.warn(filename + ':' + getMsg(arguments));
    },
    error : function (msg, vars) {
      logger.error(filename + ':' + getMsg(arguments));
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
