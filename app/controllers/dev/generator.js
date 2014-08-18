'use strict';

var logger = require('../util/logger')(__filename);
var fs = require('fs-extra');
var path = require('path');
var async = require('async');
var _ = require('lodash');
var moment = require('moment');

var appConfig = require('../../../config/app-config');
var utils = require('../utils');
var Image = require('../../../app/models/Image');
var saveEvent = require('../event/save-event')._saveEvent;

var sizes = ['small', 'medium', 'large'];

module.exports.view = function(req, res, next) {
  res.render('dev/generator', { title: 'Mock Generator' });
};

module.exports.generate = function(req, res, next) {
  logger.debug('Generating mock events...');
  var params = req.body;
  logger.debug('Gen params', params);

  // TODO Impl
  generateEvents({params: params, currentUser: req.user}, function(err, events) {
    if (err) {
      logger.error('Failed to generate events', err);
      return res.json(500, err);
    }
    res.json(200, events);
  });
};

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

      var hasLogo = !_.isUndefined(imagePath);

      // TODO: Random dates: past, current, future.
      var startMoment = randomFutureMoment();
      var endMoment = randomEndMoment(startMoment); // TODO: Fix! is the same as startMoment

      var eventData = {
        activity: donor.activity,
        name: donor.title[randomArrItem(sizes)],
        description: donor.description[randomArrItem(sizes)],

        place: { // TODO Generate random place?
          name: 'Тараса Шевченка, Київ, місто Київ, Україна',
          latitude: 50.474155,
          longitude: 30.503491
        },
        start: {
          dateTime: startMoment.toDate()
        },
        end: {
          dateTime: endMoment.toDate()
        },
//        canceledOn: undefined, // TODO

        participants: [], // TODO
        images: [] // No images at this point. We will add logo explicitly later
      };

      var saveArgs = { params: eventData, isCreate: true, currentUser: args.currentUser,
        flashFn: function(flashKey, flashValue) {
          logger.debug('Flash ', flashKey + '=' + flashValue);
        },
        beforeSaveEventFn: function(newEvent) {
          logger.debug('beforeSaveEventFn: hasLogo', hasLogo);
          if (hasLogo) {
            var logoImage = Image.newLogoFromPath(imagePath);
            logger.debug('beforeSaveEventFn: logoImage', logoImage);
            newEvent.images.push(logoImage);
          }
        }
      };
      saveEvent(saveArgs, function(resCode, resData) {
        logger.debug('Response code for save event:', resCode);
        cb(null, resData.event);
      });
    });
  }
}

function randomPastMoments() {
  // TODO
}

function randomCurrentMoments() {
  // TODO
}

function randomFutureMoments() {
  // TODO
}

function randomPastMoment() {
  return moment().
    subtract('y', utils.random(0, 2)).
    subtract('M', utils.random(0, 12)).
    subtract('d', utils.random(0, 30)).
    subtract('h', utils.random(1, 24));
}

function randomFutureMoment() {
  return moment().
    add('y', utils.random(0, 2)).
    add('M', utils.random(0, 12)).
    add('d', utils.random(0, 30)).
    add('h', utils.random(1, 24));
}

function randomEndMoment(startMoment) {
  return startMoment.
    add('d', utils.random(0, 7)).
    add('h', utils.random(1, 24)).
    add('m', utils.random(0, 3) * 15);
}

function randomArrItem(arr) {
  var idx = utils.random(0, arr.length - 1);
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