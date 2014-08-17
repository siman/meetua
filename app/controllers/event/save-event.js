'use strict';

var path = require('path');
var fs = require('fs-extra');
var _ = require('underscore');
var config = require('../../../config/app-config');
var UPLOAD_DIR = config.UPLOAD_DIR;
var EVENT_IMG_DIR = config.EVENT_IMG_DIR;
var async = require('async');
var Event = require('../../../app/models/Event');
var Image = require('../../../app/models/Image');
var tmp = require('tmp');
var notificationService = require('../util/notification-service');
var logger = require('../util/logger')(__filename);

maybeCreateImgDir(EVENT_IMG_DIR, config.PERSISTENT_DATA_DIR, function(err) {
  if (err) throw err;
});

module.exports.postSaveEvent = function(req, res) {
  var args = { params: req.body, isCreate: _.isUndefined(req.body._id), currentUser: req.user, flashFn: req.flash.bind(req) };
  saveEvent(args, function returnResp(respStatus, respData) {
    res.json(respStatus, respData);
  });
};

/**
 * @param args
 * @param {Object} args.params
 * @param {Boolean} args.isCreate
 * @param {User} args.currentUser
 * @param {Function} args.flashFn
 * @param {Function} cb
 * @returns {Function}
 */
module.exports._saveEvent = function(args, cb) {
  var params = args.params;
  var isCreate = args.isCreate;
  var currentUser = args.currentUser;
  var flashFn = args.flashFn;

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
          return cb(400, {error: errorMsg});
        }
        next();
      });
    }
    function doSave(newImages, imagesWithId) {
      return function() {
        logger.debug('doSave');
        var saveEventParams = {event: event, imagesWithId: imagesWithId, currentUser: currentUser,
          isCreate: isCreate, params: params, flashFn: flashFn};
        async.map(newImages, copyImage, buildAndSaveEvent(saveEventParams, cb));
      };
    }
}

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
 * @param {Function} args.flashFn
 * @param {User} args.currentUser
 * @param {Boolean} args.isCreate
 * @param {Function} cb
 * @returns {Function}
 */
function buildAndSaveEvent(args, cb) {
    var event = args.event;
    var imagesWithId = args.imagesWithId;
    var params = args.params;
    var flashFn = args.flashFn;
    var currentUser = args.currentUser;
    var isCreate = args.isCreate;
    return function(err, images) {
        if (err) return cb(400, err);

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
            author: currentUser._id
          });
          logger.debug('Creating event ', eventObj);
          event = new Event(eventObj);
          event.save(afterSave(event));
        }

        function updateEvent() {
          _.extend(event, params, {images: images.concat(imagesWithId)});

          logger.debug('Updating event by id', event._id, event);
          var respEvent = _.extend({}, event, {_id: event._id});
          event.save(afterSave(respEvent));
        }

        function afterSave(event) {
          return function(err) {
            if (err) {
              logger.error("error while saving event", err);
              return cb(400, {error: err});
            }

            var onNotifyComplete = function(err, resp) {
              logger.debug('Notification response: %s, error: %s', resp, err);
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

function copyImage(image, next) {
    logger.debug('copy image ', JSON.stringify(image));

  // Siman: Image uploading works for me if comment next line. Does it work on Linux as well?
//    var imagePath = path.join('/', image.name); // removes any '..'
    var imagePath = path.join(UPLOAD_DIR, image.name);

    fs.exists(imagePath, function(exists) {
        logger.debug('Image ', imagePath, 'exists ', exists);
        logger.debug('uploadDir ', UPLOAD_DIR);
        if (exists && imagePath.indexOf(UPLOAD_DIR) == 0) {
          maybeCreateImgDir(EVENT_IMG_DIR, config.PERSISTENT_DATA_DIR, function(err) {
            if (err) return next(err);
            moveFile(imagePath, EVENT_IMG_DIR, function(err, newPath) {
                next(err, _.extend(image, {name: path.basename(newPath)}));
            });
          });
        } else {
            next(new Error('Image name is invalid'));
        }
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

/**
 * Move file to specified directory generating unique name preserving file extension.
 * @param srcPath - source file path
 * @param destDir - destination dir
 * @param fileExtension - extension of the file
 * @param next
 */
function moveFile(srcPath, destDir, next) {
    logger.debug('move', srcPath, '->', destDir, 'is requested');
    tmp.tmpName({ dir: destDir, prefix: 'event-', postfix: path.extname(srcPath), tries: 100},
      function(err, destPath) {
        logger.debug('Created unique name ', destPath);
        logger.debug('Moving ', srcPath, ' to ', destPath);
        fs.copy(srcPath, destPath, function(err) {
            if (err) return next(err);

            fs.unlink(srcPath, function(err) {
                if (err) {
                    console.error('Cannot unlink file ', srcPath, err);
                }
                next(null, destPath);
            });
        });
    });
}