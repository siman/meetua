'use strict';

var appConfig = require('../../config/app-config'); // patches mongoose for every test
var mongoose = require('mongoose');
var _ = require('lodash');
var os = require('os');
var tmp = require('tmp');
tmp.setGracefulCleanup();
var fs = require('fs-extra');
var path = require('path');
var util = require('../controllers/util/utils');
var eventStore = require('../../app/controllers/event/event-store');
var userController = require('../../app/controllers/user');
var logger = require('../../app/controllers/util/logger')(__filename);

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
    var db = appConfig.secrets.db;
    console.log('Connecting to', db);
    mongoose.connect(db, function() {
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

  var ext = fileOpts && 'postfix' in fileOpts ? fileOpts.postfix : '.png';
  tmp.tmpName({template: path.join(appConfig.UPLOAD_DIR, 'tmp-XXXXXX' + ext)}, function(err, filePath) {
    if (err) return cb(err);
    var src = path.join(process.cwd(), 'app/test/resources/sample.png');
    fs.copy(src, filePath, function(err) {
      if (err) return cb(err);
      var image = _.extend({
        name: path.basename(filePath),
        path: filePath, // for tests purposes
        type: 'image/png', // currently doesn't make so much sense so can be any type
        originalName: 'my-image' + ext,
        isLogo: false
      }, imageOpts || {});
      cb(null, image);
    });
  });
};

/**
 * Shortcut for createTestImage()
 */
exports.createImage = function(fileOpts, next) {
  if (!next) {
    next = fileOpts;
    fileOpts = null;
  }
  exports.createTestImage({isLogo: false}, fileOpts, function(err, image) {
    next(err, image);
  });
};

/**
 * Shortcut for createTestImage()
 */
exports.createLogoImage = function(fileOpts, next) {
  if (!next) {
    next = fileOpts;
    fileOpts = null;
  }
  exports.createTestImage({isLogo: true}, fileOpts, function(err, image) {
    next(err, image);
  });
};


/**
 * @param doPreload
 */
exports.initDb = function(doPreload) {
  var clearDb = require('mocha-mongoose')(appConfig.secrets.db, {noClear: true});

  // new preloaded db state before each test
  var beforeEachRegistered = false;
  if (!beforeEachRegistered) {
    if ('function' == typeof beforeEach && beforeEach.length > 0) {
      // we're in a test suite that hopefully supports async operations
      if (doPreload) {
        beforeEach(clearDbAndPreload);
      }
      beforeEachRegistered = true;
    }
  }
  function clearDbAndPreload(cb) {
    // clear db to avoid double-preload and record duplicates
    clearDb(function() {
      userController.dbPreload(function() {
        eventStore.dbPreload(cb);
      });
    })
  }
};


exports.buildTestEvent = function(opts) {
  var reqData = {
    name: 'pokatushka',
    place: {
      name: 'Kiev- stalica!',
      latitude: 49,
      longitude: 50
    },
    start: {
      dateTime: new Date()
    },
    end: {
      dateTime: new Date()
    },
    description: 'event description',
    activity: 'cycling',
    images: []
  };
  return _.extend(reqData, opts);
};

/**
 * Login the user into application using http call
 * @param user
 * @param cb - receives logged in user request(superagent) instance
 */
exports.loginUser = function(user, cb) {
  var request = require('superagent');
  var userReq = request.agent();
  logger.debug('login with user 1');
  userReq
    .post(appConfig.hostname + '/api/meetua/user/login')
    .send({email: user.email, password: user.password})
    .end(function(err, res) {
      res.status.should.equal(200);
      // user1Req will manage its own cookies
      // res.redirects contains an Array of redirects
      cb(userReq);
    });
};