'use strict';

var path = require('path');
var fs = require('fs-extra');
var _ = require('underscore');
var lwip = require('lwip');
var config = require('../../../config/app-config');
var UPLOAD_DIR = config.UPLOAD_DIR;
var EVENT_IMG_DIR = config.EVENT_IMG_DIR;
var async = require('async');
var Event = require('../../models/Event');
var Image = require('../../models/Image');
var notificationService = require('../../controllers/util/notification-service');
var logger = require('../../controllers/util/logger')(__filename);
var utils = require('../../controllers/util/utils');

maybeCreateImgDir(EVENT_IMG_DIR, config.PERSISTENT_DATA_DIR, function(err) {
  if (err) throw err;
});

/**
 * @param args
 * @param {Object} args.params
 * @param {Boolean} args.isCreate
 * @param {User} args.currentUser
 * @param {Function} args.flashFn
 * @param {Function} args.beforeSaveEventFn function(event)
 * @param {Function} cb function(respStatus, respData)
 * @returns {Function}
 */
// Function is explicit here to have autocompletion in IDE
module.exports = function(args, cb) {
  var params = args.params;
  var isCreate = args.isCreate;
  var currentUser = args.currentUser;
  var flashFn = args.flashFn;
  var beforeSaveEventFn = args.beforeSaveEventFn;

  if (isCreate) {
    logger.debug('Create event request', params);
  } else {
    logger.debug('Update event request', params);
  }

  var event;
  var reqImages = params.images || [];

  if (!isCreate) {
    Event.findById(params._id, function(err, eventFound) {
      if (err) cb(500, err); // TODO find out standard way to pass errors when UI will have standard error handler
      if (!eventFound || !eventFound.author.equals(currentUser._id)) return cb(404, {error: 'Event is not found'});
      event = eventFound;

      // merge images overriding from request
      var arr = _.partition((reqImages).concat(event.images || []), function(image) {
        return !_.isUndefined(image._id);
      });
      var imagesWithId = _.uniq(arr[0], function(image) {
        return image._id.toString();
      });
      var newImages = arr[1];
      var allImages = imagesWithId.concat(newImages);
      verifyLogoCount(allImages, doSave(newImages, imagesWithId));
    });
  } else {
    verifyLogoCount(reqImages, doSave(reqImages, []));
  }

  function verifyLogoCount(images, next) {
    logger.debug('verifyLogoCount');
    async.reduce(images, 0, countLogoImages, function(err, logoCount) {
      if (err) return cb(500, err);
      if (images.length > 0 && logoCount != 1) {
        var errorMsg = 'Invalid logo count ' + logoCount;
        logger.debug(errorMsg);
        return cb(400, new Error(errorMsg));
      }
      next();
    });
  }
  function doSave(newImages, imagesWithId) {
    return function() {
      logger.debug('doSave');
      var saveEventParams = {event: event, imagesWithId: imagesWithId, currentUser: currentUser,
        isCreate: isCreate, params: params, flashFn: flashFn, beforeSaveEventFn: beforeSaveEventFn};
      async.map(newImages, processImage, buildAndSaveEvent(saveEventParams, cb));
    };
  }
};

function countLogoImages(acc, image, next) {
  image = image || {};
  var add = image.isLogo ? 1 : 0;
  next(null, acc + add);
}

/**
 * @param args
 * @param {Event} args.event
 * @param {Array} args.imagesWithId
 * @param {Object} args.params
 * @param {User} args.currentUser
 * @param {Boolean} args.isCreate
 * @param {Function} args.flashFn
 * @param {Function} args.beforeSaveEventFn function(event)
 * @param {Function} cb function(respStatus, respData)
 * @returns {Function}
 */
function buildAndSaveEvent(args, cb) {
  var event = args.event;
  var imagesWithId = args.imagesWithId || [];
  var params = args.params;
  var currentUser = args.currentUser;
  var isCreate = !_.isUndefined(args.isCreate) ? args.isCreate : true;
  var flashFn = args.flashFn || function() {};
  var beforeSaveEventFn = args.beforeSaveEventFn || function() {};

  return function(err, images) {
    if (err) {
      logger.warn('Failed to copy images and therefore cannot save event', err);
      return cb(400, err);
    }

    delete params.images;

    if (event) {
      updateEvent();
    } else {
      createEvent();
    }

    function createEvent() {
      var eventObj = _.extend(params, {
        images: _.map(images, function(image){
          return new Image(image);
        }),
        author: currentUser._id,
        participants: [{user: currentUser._id, guests: 0}]
      });
      logger.debug('Creating event ', eventObj);
      event = new Event(eventObj);
      beforeSaveEventFn(event);
      event.save(afterSave(event));
    }

    function updateEvent() {
      _.extend(event, params, {images: images.concat(imagesWithId)});

      logger.debug('Updating event by id', event._id, event);
      var respEvent = _.extend({}, event, {_id: event._id});
      beforeSaveEventFn(respEvent);
      event.save(afterSave(respEvent));
    }

    function afterSave(event) {
      return function(err) {
        if (err) {
          logger.error("error while saving event", err);
          return cb(400, err);
        }

        var onNotifyComplete = function(err, resp) {
          logger.debug('Notification response:', resp, 'error:', err);
        };
        if (isCreate) {
          notificationService.notifyAuthorOnCreate(event, onNotifyComplete)
        } else {
          notificationService.notifyParticipantOnEdit(event, onNotifyComplete);
        }

        var respJson = {event: event};
        logger.debug('Sending response', respJson);
        flashFn('success', { msg: isCreate ? 'Ваше событие создано! Детали отправлены Вам на почту.': 'Ваше событие обновлено!' });
        if (isCreate) {
          flashFn('showFirstTime', 'true')
        }
        cb(200, respJson);
      }
    }
  };
}
function processImage(image, next) {
  logger.debug('process image', image);
  function copy(next) {
    copyImage(image, next);
  }
  function renameOriginal(image, next) {
    utils.renamePrefix(image.path, 'original-', function(err, newPath) {
      logger.debug('Renamed image', image.path, 'to', newPath);
      image.path = newPath;
      image.name = path.basename(newPath);
      next(err, image);
    });
  }
  function createThumbnail(image, next) {
    logger.debug('create thumbnail for image', image.path, image);
    function openImage(next) {
      logger.debug('open lwip image', image.path);
      var p = image.path.toString();
      lwip.open(p, next);
    }
    function cover(img, next) {
      var targetWidth = config.eventThumbnail.width;
      var targetHeight = config.eventThumbnail.height;
      var coveredDimensions = utils.dimensionsToCover(img.width(), img.height(), targetWidth, targetHeight);
      logger.debug('original dimensions', img.width(), 'x', img.height());
      logger.debug('resize to', coveredDimensions.width, 'x', coveredDimensions.height);
      img.resize(coveredDimensions.width, coveredDimensions.height, function(err, scaledImg) {
        if (err) return next(err);
        logger.debug('crop to', targetWidth, 'x', targetHeight);
        scaledImg.crop(targetWidth, targetHeight, next);
      });
    }

  function save(img, next) {
      logger.debug('save thumbnail for', image.path);
      var thumbnailPath = utils.prefixFileName(image.path, 'thumbnail-');
      img.writeFile(thumbnailPath, function(err) {
        logger.debug('saved thumbnail to', thumbnailPath, 'for', image.path);
        next(err, thumbnailPath);
      });
    }
    async.waterfall([openImage, cover, save], next);
  }
  function transform(image, next) {
    async.waterfall([
      function(next) { createThumbnail(image, next) },
      function(thumbnailPath, next) {
        renameOriginal(image, function(err, renamedOriginal) {
          renamedOriginal.thumbnailName = path.basename(thumbnailPath);
          next(err, renamedOriginal);
        });
      }
    ], next);
  }
  async.waterfall([copy, transform], next);
}


function copyImage(image, next) {
  logger.debug('copy image', image);

  var imagePath = path.join(UPLOAD_DIR, image.name);

  fs.exists(imagePath, function (exists) {
    logger.debug('Image ', imagePath, 'exists ', exists);
    logger.debug('uploadDir ', UPLOAD_DIR);
    var starts = imagePath.indexOf(UPLOAD_DIR) == 0;
    if (!exists) return next(new Error('Image ' + image.name + ' doesn\'t exist in ' + UPLOAD_DIR));
    if (!starts) return next(new Error('Image name is invalid'));
    maybeCreateImgDir(EVENT_IMG_DIR, config.PERSISTENT_DATA_DIR, function (err) {
      if (err) return next(err);
      utils.moveFile(imagePath, EVENT_IMG_DIR, function (err, newPath) {
        next(err, _.extend(image, {name: path.basename(newPath), path: newPath}));
      });
    });
  });
}

function maybeCreateImgDir(imgDir, persistentDir, next) {
  fs.exists(imgDir, function(alreadyExists) {
    logger.debug('imgDir', imgDir, 'exists', alreadyExists);
    if (alreadyExists) return next(null);

    logger.debug('mkdirp', persistentDir);
    fs.mkdirp(persistentDir, function(err) {
      if (err) return next(err);
      logger.debug('symlink', persistentDir, '->', imgDir);
      fs.symlink(persistentDir, imgDir, function(err) { // symlink imgDir -> persistentDir
        next(err);
      });
    });
  });
}