'use strict';

var logger = require('../util/logger')(__filename);
var fs = require('fs-extra');
var path = require('path');
var async = require('async');
var _ = require('lodash');
var moment = require('moment');

var appConfig = require('../../../config/app-config');
var utils = require('../util/utils');
var rand = require('../util/rand');
var Image = require('../../../app/models/Image');
var Event = require('../../../app/models/Event');
var saveEvent = require('../../services/events').save;
var imagesService = require('../../services/images');

var sizes = ['small', 'medium', 'large'];

module.exports.view = function(req, res, next) {
  res.render('dev/event-generator', { title: 'Event generator' });
};

module.exports.generate = function(req, res, next) {
  logger.debug('Generating mock events...');
  var params = req.body;
  logger.debug('Gen params', params);

  function cleanDatabase(cb) {
    logger.debug('clean database');
    function findGenerated(next) {
      logger.debug('find generated events');
      Event.find({isGenerated: true}, next);
    }
    function rmSingleEventImages(event, next) {
      async.each(event.images, function(image, next) {
        if (image) {
          logger.debug('rm event image', image._id);
          imagesService.remove({eventId: event._id, imageId: image._id, userId: req.user._id}, next);
        } else next();
      }, next);
    }
    function removeSingleEvent(event, next) {
      logger.debug('remove event', event._id);
      event.remove(function(err) {
        if (!err) logger.debug('Event', event.name, 'is removed');
        else logger.error('Failed to remove event', err);
        return next(err);
      });
    }
    function rm(events, next) {
      async.series([function(next) {
        logger.debug('rm events images');
        async.each(events, rmSingleEventImages, next);
      }, function(next) {
        logger.debug('rm events');
        async.each(events, removeSingleEvent, next);
      }], next);
    }
    async.waterfall([findGenerated, rm], cb);
  }

  function callGenerate(cb) {
    logger.debug('generating events');
    generateEvents({params: params, currentUser: req.user}, function(err, events) {
      if (err) {
        logger.error('Failed to generate events', err);
        return cb(err);
      }
      logger.debug('Generated events', events.length, events);
      cb(null, events);
    });
  }

  function end(err, results) {
    if (err) return res.json(500, err);
    res.json(200, results.callGenerate);
  }

  var fns = {};
  if (params.cleanDatabase) {
    fns.cleanDatabase = cleanDatabase;
  }
  fns.callGenerate = callGenerate;
  async.series(fns, end);
};

/**
 * @param args
 * @param args.params
 * @param {Function} cb
 */
function generateEvents(args, cb) {
  var allIsRandom = args.params.isRandom;
  var actFilter = allIsRandom ? undefined : args.params.activities;
  var eventCountArr = []; // Size of array is a count of events to generate.
  for (var i = 0; i < args.params.eventCount; i++) {
    eventCountArr.push(i);
  }
  function readDescriptionFile(fileItem, cb) {
    fs.readJson(fileItem.path, cb);
  }
  function readImageFile(fileItem, cb) {
    cb(null, fileItem);
  }
  async.parallel({
    images: function(cb) {
      findFiles('images', actFilter, readImageFile, cb);
    },
    descriptions: function(cb) {
      findFiles('descriptions', actFilter, readDescriptionFile, cb);
    }
  }, function(err, results) {
    async.reduce(eventCountArr, [], function(memo, item, cb) {
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
//    logger.debug('imageFiles', imageFiles);

  var donor = rand.randomArrItem(descFiles);
  var activityImages = _.filter(imageFiles, function(file) {
    return file.activity == donor.activity;
  });
//    logger.debug('activityImages', activityImages);
  var image = rand.randomArrItem(activityImages);
  async.waterfall([
    function uploadImage(cb) {
      if (image) {
        utils.copyFile(image.path, appConfig.UPLOAD_DIR, cb);
      } else {
        cb();
      }
    }
  ], function(err, imagePath) {
    if (err) return cb(err);

    var hasLogo = !_.isUndefined(imagePath);

    // TODO: Random dates: past, current, future.
    var startMoment = rand.randomFutureMoment();
    var endMoment = rand.randomEndMoment(startMoment);
    var eventPrice = rand.randomPrice();

    var images = [];
    if (hasLogo) {
      var logoImage = Image.newLogoFromPath(imagePath);
      images.push(logoImage.toObject()); // needs plain image, since it adds custom fields for processing image
    }

    var eventData = {
      activity: donor.activity,
      name: donor.title[rand.randomArrItem(sizes)],
      description: donor.description[rand.randomArrItem(sizes)],
      place: rand.randomPlace(),
      start: {
        dateTime: startMoment.toDate()
      },
      end: {
        dateTime: endMoment.toDate()
      },
//        canceledOn: undefined, // TODO
      participants: [], // TODO
      price: {
        amount: eventPrice,
        currency: "UAH"
      },
      images: images
    };

    var saveArgs = { params: eventData, isCreate: true, currentUser: args.currentUser,
      flashFn: function(flashKey, flashValue) {
        logger.debug('Flash ', flashKey + '=' + flashValue);
      },
      beforeSaveEventFn: function(newEvent) {
        newEvent.isGenerated = true;
      }
    };
    saveEvent(saveArgs, function(resCode, resData) {
      logger.debug('Response code for save event:', resCode);
      cb(null, resData.event);
    });
  });
}

/**
 * @param {String} typeOfFiles Possible values: descriptions, images.
 * @param {Array} filterActsArr List of activities to generate. Example: ['cycling', 'it', 'langs']
 * @param {Function} readFileFn function({activity: '', path: ''}, cb)
 * @param {Function} cb
 */
function findFiles(typeOfFiles, filterActsArr, readFileFn, cb) {
  var staticDir = path.join(process.cwd(), 'app/generator/static');
  async.waterfall([
    function readActDirs(cb) {
      fs.readdir(staticDir, function(err, allFoundActDirs) {
        var filteredActDirs = _.isUndefined(filterActsArr) ? allFoundActDirs :
          _.filter(allFoundActDirs, function(actName) {
            return filterActsArr.indexOf(actName) >= 0;
          });
        cb(err, filteredActDirs);
      });
    },
    function readFiles(actDirs, cb) {
      logger.debug("Filtered activity dirs of " + typeOfFiles + ":", actDirs);
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
      async.map(files, readFileFn, cb);
    }
  ], function(err, files) {
    logger.debug('Found ' + typeOfFiles + ' files:', files.length);
    return cb(err, files);
  });
}