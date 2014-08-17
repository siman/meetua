'use strict';

var logger = require('../util/logger')(__filename);
var fs = require('fs-extra');
var path = require('path');
var async = require('async');
var random = require("random-js")();
var _ = require('lodash');
var utils = require('../utils');
var appConfig = require('../../../config/app-config');

module.exports.view = function(req, res, next) {
  res.render('dev/generator', { title: 'Mock Generator' });
};

module.exports.generate = function(req, res, next) {
  logger.debug('Generating mock events...');
  var params = req.body;
  logger.debug('Gen params', params);

  // TODO Impl
  generateEvents({params: params}, function(err, events) {
    if (err) {
      logger.error('Failed to generate events', err);
      return res.json(500, err);
    }
    res.json(200, events);
  });
};

var sizes = ['small', 'medium', 'large'];

function randomSize() {
  var idx = random.integer(0, sizes.length - 1);
  return sizes[idx];
}

function generateEvents(args, cb) {
  var arr = [];
  for (var i = 0; i < args.params.eventCount; i++) {
    arr.push(i);
  }
  function readDescriptionFile(fileItem, cb) {
    fs.readJson(fileItem.path, cb);
  }
  function readImageFile(fileItem, cb) {
    cb(null, fileItem);
  }
  async.parallel({
    images: function(cb) {
      findFiles('images', readImageFile, cb);
    },
    descriptions: function(cb) {
      findFiles('descriptions', readDescriptionFile, cb);
    }
  }, function(err, results) {
    async.reduce(arr, [], function(memo, item, cb) {
      generateEvent(_.extend({}, args, results), function(err, event) {
        memo.push(event);
        cb(err, memo);
      });
    }, cb);
  });
}
/**
 * @param args
 * @param args.params
 * @param args.images
 * @param args.descriptions
 * @param {Function} cb function(err, event)
 */
function generateEvent(args, cb) {
  var descFiles = args.descriptions;
  var imageFiles = args.images;

  if (args.params.isRandom) {
    var donor = randomArrItem(descFiles);
    logger.debug('imageFiles', imageFiles);
    var activityImages = _.filter(imageFiles, function(file) {
      return file.activity == donor.activity;
    });
    logger.debug('activityImages', activityImages);
    var image = randomArrItem(activityImages);
    async.waterfall([
      function uploadImage(cb) {
        if (image) {
          utils.copyFile(image.path, appConfig.EVENT_IMG_DIR, cb);
        } else {
          cb();
        }
      }
    ], function(err, imagePath) {
      if (err) return cb(err);
      var event = {
        activity: donor.activity,
        title: donor.title[randomSize()],
        description: donor.description[randomSize()],
        imagePath: imagePath ? '/upload/' + path.basename(imagePath) : '' // TODO Image
      };
      cb(null, event);
    });
  }
}

function randomArrItem(arr) {
  var idx = random.integer(0, arr.length - 1);
  return arr[idx];
}

/**
 * @param {String} typeOfFiles possible values: ['descriptions', 'images']
 * @param {Function} readFile function({activity: '', path: ''}, cb)
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
      async.reduce(actDirs, [], function(memo, actDir, cb) {
        var pathPrefix = staticDir + '/' + actDir + '/' + typeOfFiles;
        fs.readdir(pathPrefix, function(err, files) {
          if (err && err.code == 'ENOENT') {
            logger.warn('Cannot find ' + typeOfFiles + ' for', actDir);
            return cb(null, memo);
          }
          var fileItems = _.map(files, function(file) {
            return {activity: actDir, path: path.join(pathPrefix, file)};
          });
          cb(err, memo.concat(fileItems));
        });
      }, cb);
    },
    function readContents(files, cb) {
      async.map(files, readFile, cb);
    }
  ], function(err, files) {
    logger.debug('Found ' + typeOfFiles + ' files', files.length);
    return cb(err, files);
  });
}