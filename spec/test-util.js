var mongoose = require('mongoose');
var _ = require('underscore');
var tmp = require('tmp');
var fs = require('fs-extra');
var path = require('path');
var util = require('../controllers/util');

_.extend(module.exports, util);

exports.reqUser = function(user) {
    return function(req, res, next) {
        req.user = user;
        next();
    }
};

exports.errorHandler = function(err, req, res, next) {
    console.error('Error ', err);
    next();
};

exports.mongoConnect = function(done) {
    console.log('Connecting ...');
    mongoose.connect('mongodb://localhost/testdb', function() {
        console.log('Connected');
        done();
    });
};

exports.mongoDisconnect = function(done) {
    console.log('Closing connection');
    mongoose.connection.close(function() {
        console.log('Connection is closed');
        done();
    });
};


/**
 * @param imageOpts
 * @param fileOpts
 * @param cb
 * @example createTestImage(cb)
 * @example createTestImage({isLogo: true}, cb)
 * @example createTestImage({isLogo: true}, {postfix: '.jpg'}, cb)
 */
exports.createTestImage = function(imageOpts, fileOpts, cb) {
  if (!cb) {
    cb = fileOpts;
    if (!fileOpts) {
      cb = imageOpts;
    }
  }

  tmp.file(fileOpts || {}, function(err, filePath, fd) {
    var content = new Buffer('image content');
    var image = _.extend({
      name: path.basename(filePath),
      type: 'image/jpg',
      originalName: 'my-image.jpg',
      isLogo: false
    }, imageOpts || {});
    fs.writeSync(fd, content, 0, content.length, 0);
    cb(image);
  });
};