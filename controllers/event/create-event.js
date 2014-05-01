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
    console.log('Create event request ', data);

    var images = req.body.images || [];
    async.map(images, verifyAndCopyImage, buildAndSaveEvent(req, res, next));
};

function buildAndSaveEvent(req, res, next) {
    return function(err, images) {
        if (err) return next(err);
        console.log('Copied images ', images);
        var event = new Event(_.extend(req.body, {
            images: _.map(images, function(image){
                return new Image(image);
            }),
            author: req.user._id
        }));
        console.log('Saving event ', event);
        event.save(function(err) {
            if (err) return next(err);
            var data = {event: event};
            console.log('Sending response ', data);
            res.send(data);
        });
    }
}

function verifyAndCopyImage(image, next) {
    console.log('Verify image ', image);

  // Siman: Image uploading works for me if comment next line. Does it work on Linux as well?
//    var imagePath = path.join('/', image.path); // removes any '..'
    var imagePath = image.path;

    fs.exists(imagePath, function(exists) {
        console.log('Image exists ', exists);
        console.log('uploadDir ', UPLOAD_DIR);
        if (exists && imagePath.indexOf(UPLOAD_DIR) == 0) {
            moveFile(imagePath, EVENT_IMG_DIR, function(err, newPath) {
                next(err, _.extend(image, {path: newPath}));
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
    tmp.tmpName({ dir: destDir, postfix: path.extname(srcPath)}, function(err, destPath) {
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