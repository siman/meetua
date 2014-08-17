'use strict';

var logger = require('../util/logger')(__filename);

module.exports.view = function(req, res, next) {
  res.render('dev/generator', { title: 'Mock Generator' });
};

module.exports.generate = function(req, res, next) {
  logger.debug('Generating mock events...');
  var params = req.body;
  logger.debug('Gen params', params);

  // TODO Impl
  
  res.send(200);
};
