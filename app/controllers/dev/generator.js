'use strict';

var logger = require('../util/logger')(__filename);
var fs = require('fs-extra');
var path = require('path');
var async = require('async');

module.exports.view = function(req, res, next) {
  res.render('dev/generator', { title: 'Mock Generator' });
};

module.exports.generate = function(req, res, next) {
  logger.debug('Generating mock events...');
  var params = req.body;
  logger.debug('Gen params', params);

  // TODO Impl
  generateEvent({params: params}, function(err, event) {
    if (err) {
      logger.error('Failed to generate events', err);
      return res.json(500, err);
    }
    res.send(200);
  });
};

/**
 * @param args
 * @param args.params
 * @param {Function} cb function(err, event)
 */
function generateEvent(args, cb) {
  findFiles('descriptions', function(err, files) {
    cb(err);
  });
}

/**
 * @param {String} typeOfFiles possible values: ['descriptions', 'images']
 * @param cb
 */
function findFiles(typeOfFiles, cb) {
  var staticDir = path.join(process.cwd(), 'app/generator/static');
  async.waterfall([
    function readActDirs(cb) {
      fs.readdir(staticDir, cb);
    },
    function readFiles(actDirs, cb) {
      logger.debug('actDirs', actDirs);
      async.reduce(actDirs, [], function(memo, file, cb) {
        fs.readdir(staticDir + '/' + file + '/' + typeOfFiles, function(err, files) {
          if (err && err.code == 'ENOENT') {
            logger.warn('Cannot find ' + typeOfFiles + ' for', file);
            return cb(null, memo);
          }
          cb(err, memo.concat(files));
        });
      }, cb);
    }
  ], function(err, files) {
    logger.debug('Found mock files', files);
    return cb(err, files);
  });
}