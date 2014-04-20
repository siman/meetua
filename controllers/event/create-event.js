var path = require('path');
var fs = require('fs-extra');
var _ = require('underscore');
var UPLOAD_DIR = require('../upload').UPLOAD_DIR;
var EVENT_IMG_DIR = './public/img/events';
var async = require('async');
var Event = require('../../models/Event');
var Image = require('../../models/Image');

exports.createEvent = function(req, res, next) {
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
            res.send(event);
        });
    }
};

exports.verifyAndCopyImage = function(opts) {
    var uploadDir = opts.uploadDir;
    var eventImgDir = opts.eventImgDir;

    return function(image, next) {
        console.log('Verify image ', image);
        var imagePath = path.join('/', image.path); // removes any '..'
        fs.exists(imagePath, function(exists) {
            console.log('Image exists ', exists);
            console.log('uploadDir ', uploadDir);
            if (exists && imagePath.indexOf(uploadDir) == 0) {
                var imageName = path.basename(imagePath);
                var copyTo = path.join(eventImgDir, imageName);
                console.log('Copy ', imagePath, ' to ', copyTo);
//                fs.rename(imagePath, copyTo, function(err) {
//                    next(null, _.extend(image, {path: copyTo}));
//                });
                // TODO replace with fs.copy()
                fs.mkdirp(eventImgDir, function(err) {
                    if (err) next(err);

                    var wstream = fs.createWriteStream(copyTo);
                    var rstream = fs.createReadStream(imagePath);
                    rstream.pipe(wstream);
                    rstream.on('error', next);
                    wstream.on('error', next);
                    rstream.on('end', onCopyEnd);
                    function onCopyEnd() {
                        var copiedImage = _.extend(image, {path: copyTo});
                        fs.unlink(imagePath, function(err) {
                            if (err)
                            console.error('Cannot unlink file ', imagePath, err);
                        });
                        next(null, copiedImage);
                    }
                });
            } else {
                next(null, image);
            }
        });
    };
};

var verifyAndCopyImage = exports.verifyAndCopyImage({uploadDir: UPLOAD_DIR, eventImgDir: EVENT_IMG_DIR});