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

module.exports = function(req, res, next) {
    var data = req.body;
    if (isCreate(req)) {
      console.log('Create event request', data);
    } else {
      console.log('Update event request', data);
    }

    var images = req.body.images || [];
    async.map(images, verifyAndCopyImage, buildAndSaveEvent(req, res, next));
};

function isCreate(req) {
  return _.isUndefined(req.body._id);
}

function buildAndSaveEvent(req, res, next) {
    function countLogoImages(acc, image, next) {
      var add = image.isLogo ? 1 : 0;
      next(null, acc + add);
    }
    return function(err, images) {
        if (err) return next(err);
        async.reduce(images, 0, countLogoImages, function(err, logoCount) {
          if (err) return next(err);
          if (images.length > 0 && logoCount != 1) return res.json(400, {error: 'Invalid logo count ' + logoCount});

          var eventObj = _.extend(req.body, {
            images: _.map(images, function(image){
              return new Image(image);
            }),
            author: req.user._id
          });
          var event = new Event(eventObj);
          if (isCreate(req)) {
            console.log('Creating event ', eventObj);
            event.save(afterSave);
          } else {
            console.log('Updating event ', eventObj);
            delete eventObj._id;
            event.update(eventObj, afterSave);
          }
          function afterSave(err) {
            console.log('afterSave');
            if (err) return next(err);
            var data = {event: event};
            console.log('Sending response ', data);
            req.flash('success', { msg: isCreate(req) ? 'Ваше событие создано!' : 'Ваше событие обновлено!' });
            res.send(data);
          }
        });
    };
}

function verifyAndCopyImage(image, next) {
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