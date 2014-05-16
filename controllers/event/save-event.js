'use strict';

var path = require('path');
var fs = require('fs-extra');
var _ = require('underscore');
var config = require('../../config/app-config');
var UPLOAD_DIR = config.UPLOAD_DIR;
var EVENT_IMG_DIR = config.EVENT_IMG_DIR;
var async = require('async');
var Event = require('../../models/Event');
var Image = require('../../models/Image');
var tmp = require('tmp');
var notificationService = require('../util/notificationService');

module.exports = function(req, res, next) {
    if (isCreate(req)) {
      console.log('Create event request', req.body);
    } else {
      console.log('Update event request', req.body);
    }

    var event;
    var reqImages = req.body.images || [];

    if (!isCreate(req)) {
      Event.findById(req.body._id, function(err, eventFound) {
        if (err) res.json(500, err); // TODO find out standard way to pass erorrs when UI will have standard error handler
        if (!eventFound || !eventFound.author.equals(req.user._id)) return res.json(404, {error: 'Event is not found'});
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

    function verifyLogoCount(images, cb) {
      async.reduce(images, 0, countLogoImages, function(err, logoCount) {
        if (err) return res.json(500, err);
        console.log('verifyLogoCount', images.length, logoCount);
        if (images.length > 0 && logoCount != 1) {
          var errorMsg = 'Invalid logo count ' + logoCount;
          console.log(errorMsg);
          return res.json(400, {error: errorMsg});
        }
        cb();
      });
    }
    function doSave(newImages, imagesWithId) {
      return function() {
        async.map(newImages, copyImage, buildAndSaveEvent(event, imagesWithId, req, res, next));
      };
    }
};

function isCreate(req) {
  return _.isUndefined(req.body._id);
}

function countLogoImages(acc, image, next) {
  var add = image.isLogo ? 1 : 0;
  next(null, acc + add);
}

function buildAndSaveEvent(event, imagesWithId, req, res, next) {
    return function(err, images) {
        if (err) return res.json(500, err);

        delete req.body.images;

        if (event) {
          updateEvent();
        } else {
          createEvent();
        }

        function createEvent() {
          var eventObj = _.extend(req.body, {
            images: _.map(images, function(image){
              return new Image(image);
            }),
            author: req.user._id
          });
          console.log('Creating event ', eventObj);
          event = new Event(eventObj);
          event.save(afterSave(event));
        }

        function updateEvent() {
          _.extend(event, req.body, {images: images.concat(imagesWithId)});

          console.log('Updating event by id', event._id, event);
          var respEvent = _.extend({}, event, {_id: event._id});
          event.save(afterSave(respEvent));
        }

        function afterSave(event) {
          return function(err) {
            if (err) return res.json(400, {error: err});

            if(isCreate(req)) notificationService.notifyAuthorOnCreate(event);
              else notificationService.notifyParticipantOnEdit(event);

            var respJson = {event: event};
            console.log('Sending response ', respJson);
            req.flash('success', { msg: isCreate(req) ? 'Ваше событие создано!': 'Ваше событие обновлено!' });
            res.send(respJson);
          }
        }
    };
}

function copyImage(image, next) {
    console.log('Verify image ', image);

  // Siman: Image uploading works for me if comment next line. Does it work on Linux as well?
//    var imagePath = path.join('/', image.name); // removes any '..'
    var imagePath = path.join(UPLOAD_DIR, image.name);

    fs.exists(imagePath, function(exists) {
        console.log('Image exists ', exists);
        console.log('uploadDir ', UPLOAD_DIR);
        if (exists && imagePath.indexOf(UPLOAD_DIR) == 0) {
            moveFile(imagePath, EVENT_IMG_DIR, function(err, newPath) {
                next(err, _.extend(image, {name: path.basename(newPath)}));
            });
        } else {
            next(null, image);
        }
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
    tmp.tmpName({ dir: destDir, prefix: 'event-', postfix: path.extname(srcPath), tries: 100},
      function(err, destPath) {
        console.log('Created unique name ', destPath);
        console.log('Moving ', srcPath, ' to ', destPath);
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