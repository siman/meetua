var path = require('path');
var fs = require('fs');
var _ = require('underscore');
var UPLOAD_DIR = require('../upload').UPLOAD_DIR;
var EVENT_IMG_DIR = './public/img/events';
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
}

function verifyAndCopyImage(image, next) {
    var imagePath = path.join('/', image.path); // removes any '..'
    fs.exists(imagePath, function(exists) {
        if (exists && imagePath.indexOf(UPLOAD_DIR) == 0) {
            var imageName = path.basename(imagePath);
            var copyTo = path.join(EVENT_IMG_DIR, imageName);
            console.log('Copy ', imagePath, ' to ', copyTo);
            var wstream = fs.createWriteStream(copyTo);
            var rstream = fs.createReadStream(imagePath);
            rstream.pipe(wstream);
            rstream.on('end', onCopyEnd);
            function onCopyEnd() {
                fs.unlink(imagePath, function(err){
                    console.error('Failed to remove temp file ', imagePath);
                });
                var copiedImage = _.extend(image, {path: copyTo});
                next(null, copiedImage);
            }
        } else {
            next(null, image);
        }
    });
}