var path = require('path');
var fs = require('fs-extra');
var _ = require('underscore');
var config = require('../../config/app-config');
var UPLOAD_DIR = config.UPLOAD_DIR;
var EVENT_IMG_DIR = config.EVENT_IMG_DIR;
var async = require('async');
var Event = require('../../models/Event');
var Image = require('../../models/Image');

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
        var event = new Event({
            name: req.body.name,
            author: req.user._id,
            description: req.body.description,
            activity: req.body.activity,
            place: {
                name: req.body.place.name,
                latitude: req.body.place.latitude,
                longitude: req.body.place.longitude
            },
            start: {
                date: req.body.start.date,
                time: req.body.start.time
            },
            end: {
                date: req.body.end.date,
                time: req.body.end.time
            },
            images: _.map(images, function(image){
                return new Image(image);
            })
        });
        console.log('Saving event ', event);
        event.save(function(err) {
            if (err) return next(err);
            var data = {event: event};
            console.log('Sending response ', data);
            res.send(data);
        });
    }
};

function verifyAndCopyImage(image, next) {
    console.log('Verify image ', image);
    var imagePath = path.join('/', image.path); // removes any '..'
    fs.exists(imagePath, function(exists) {
        console.log('Image exists ', exists);
        console.log('uploadDir ', UPLOAD_DIR);
        if (exists && imagePath.indexOf(UPLOAD_DIR) == 0) {
            var imageName = path.basename(imagePath);
            var copyTo = path.join(EVENT_IMG_DIR, imageName);
            moveFile(imagePath, copyTo, function(err) {
                next(err, _.extend(image, {path: copyTo}));
            });
        } else {
            next(null, image);
        }
    });
};
function moveFile(srcPath, destPath, next) {
    console.log('Moving ', srcPath, ' to ', destPath);
    fs.copy(srcPath, destPath, function(err) {
        if (err) return next(err);

        fs.unlink(srcPath, function(err) {
            if (err) {
                console.error('Cannot unlink file ', srcPath, err);
            }
            next(null);
        });
    });
}