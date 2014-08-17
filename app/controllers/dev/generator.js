'use strict';

var logger = require('../util/logger')(__filename);
var fs = require('fs-extra');
var path = require('path');
var async = require('async');
var random = require("random-js")();
var _ = require('lodash');

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
    res.json(200, [event]);
  });
};

var sizes = ['small', 'medium', 'large'];

function randomSize() {
  var idx = random.integer(0, sizes.length - 1);
  return sizes[idx];
}

/**
 * @param args
 * @param args.params
 * @param {Function} cb function(err, event)
 */
function generateEvent(args, cb) {
  function readDescriptionFile(file, cb) {
    fs.readJson(file, cb);
  }

  findFiles('descriptions', readDescriptionFile, function(err, files) {
    if (err) return cb(err);

    if (args.params.isRandom) {
      var randomFileIdx = random.integer(0, files.length - 1);
      var donor = files[randomFileIdx];
      var event = {
        activity: donor.activity,
        title: donor.title[randomSize()],
        description: donor.description[randomSize()]
      };
      cb(null, event);
    }
  });
}

/**
 * @param {String} typeOfFiles possible values: ['descriptions', 'images']
 * @param cb
 */
function findFiles(typeOfFiles, readFile, cb) {
  var staticDir = path.join(process.cwd(), 'app/generator/static');
  async.waterfall([
    function readActDirs(cb) {
      fs.readdir(staticDir, cb);
    },
    function readFiles(actDirs, cb) {
      logger.debug('actDirs', actDirs);
      async.reduce(actDirs, [], function(memo, file, cb) {
        var pathPrefix = staticDir + '/' + file + '/' + typeOfFiles;
        fs.readdir(pathPrefix, function(err, files) {
          if (err && err.code == 'ENOENT') {
            logger.warn('Cannot find ' + typeOfFiles + ' for', file);
            return cb(null, memo);
          }
          var filePaths = _.map(files, function(file) {
            return path.join(pathPrefix, file);
          });
          cb(err, memo.concat(filePaths));
        });
      }, cb);
    },
    function readContents(files, cb) {
      async.map(files, readFile, cb);
    }
  ], function(err, files) {
    logger.debug('Found mock files', files);
    return cb(err, files);
  });
}