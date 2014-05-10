var mongoose = require('mongoose');
var _ = require('underscore');
var tmp = require('tmp');
var fs = require('fs-extra');

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


exports.createTestImage = function(imageOpts, cb) {
  if (!cb) {
    cb = imageOpts;
  }
  tmp.file(function(err, filePath, fd) {
    var content = new Buffer('image content');
    var image = _.extend({
      path: filePath,
      type: 'image/jpg',
      name: 'my-image.jpg',
      isLogo: false
    }, imageOpts);
    fs.writeSync(fd, content, 0, content.length, 0);
    cb(image);
  });
};