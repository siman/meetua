var mongoose = require('mongoose');
var fs = require('fs-extra');
var flash = require('express-flash');
var path = require('path');
var os = require('os');
var request = require('supertest');
var express = require('express');
var Event = require('../../models/Event');
var testUtil = require('../../spec/test-util');
var _ = require('lodash');
var config = require('../../../config/app-config'); // patches mongoose
var async = require('async');
var notificationService = require('../../controllers/util/notification-service');
notificationService.notifyAuthorOnCreate = function(arg, cb) {cb();}; // mock
notificationService.notifyParticipantOnEdit = function(arg, cb) {cb();}; // mock
var moment = require('moment');
var should = require('chai').should();

var saveEvent = require('../../controllers/events-ctrl').save;
var testImageOpts = {dir: config.UPLOAD_DIR};

describe('save-event', function() {
  var user = { _id: mongoose.Types.ObjectId() };
  var app = express();
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.session({
    secret: 's3cr3t'
  }));
  app.use(flash());
  app.use(testUtil.reqUser(user));
  app.post('/event/save/:eventId', saveEvent);
  app.use(testUtil.errorHandler);

  beforeEach(testUtil.mongoConnect);
  afterEach(testUtil.mongoDisconnect);

  function callSaveEvent(reqData) {
    return request(app)
      .post('/event/save/' + reqData.id)
      .send(reqData);
  }

  describe('create-event', function() {
    it('should save event to the database', function(done) {
      callSaveEvent(testUtil.buildTestEvent())
        .expect(isOk)
        .end(function(err, res) {
          if (err) return done(err);
          Event.findOne({_id: res.body.event._id }, function(err, doc) {
            should.exist(doc);
            done();
          })
        });
    });
    it('should add author as a participant', function(done) {
      callSaveEvent(testUtil.buildTestEvent())
        .expect(isOk)
        .end(function(err, res) {
          if (err) return done(err);
          Event.findOne({_id: res.body.event._id }, function(err, doc) {
            doc.participants[0].user.equals(user._id).should.be.true;
            doc.participants[0].guests.should.equal(0);
            done();
          })
        });
    });
    it('should sanitize description', function(done) {
      callSaveEvent(testUtil.buildTestEvent({description: '<p><script>alert("XSS");</script><b>Text</b></p>'}))
        .expect(isOk)
        .end(function(err, res) {
          if (err) return done(err);
          Event.findOne({_id: res.body.event._id }, function(err, doc) {
            should.exist(doc);
            doc.description.should.equal('<p><b>Text</b></p>');
            done();
          })
        });
    });
    it('should save event when latitude and longitude not selected', function(done) {
      callSaveEvent(testUtil.buildTestEvent({ place:{ name: 'Malibu', latitude: undefined, longitude: undefined }}))
        .expect(isOk)
        .end(function(err, res) {
          if (err) return done(err);
          Event.findOne({_id: res.body.event._id }, function(err, doc) {
            should.exist(doc);
            done();
          })
        });
    });
    it('should move image to the new dir creating dest dir if necessary', function(done) {
      createLogo(function(err, reqImage) {
        if (err) return done(err);
        fs.removeSync(config.EVENT_IMG_DIR);

        callSaveEvent(testUtil.buildTestEvent({images: [reqImage]}))
          .expect(isOk)
          .end(function(err, res) {
            if (err) return done(err);
            var copiedImage = res.body.event.images[0];
            copiedImage.originalName.should.equal(reqImage.originalName);
            copiedImage.type.should.equal(reqImage.type);
            fs.existsSync(testUtil.savedImageNameToPath(copiedImage.name)).should.be.true;
            fs.existsSync(testUtil.uploadedImageNameToPath(reqImage.name)).should.be.false;
            done();
          });
      });
    });
    it('should forbid multiple logos', function(done) {
      async.parallel([createLogo, createLogo], function(err, images) {
        callSaveEvent(testUtil.buildTestEvent({images: images}))
          .expect(400)
          .end(done);
      });
    });
    // TODO this crashes on thumbnail, I have no idea why... think...
//    it('should generate unique name for image in the new dir and preserve file extension', function(done) {
//      createLogo({postfix: '.png'}, function(err, reqImage) {
//        if (err) return done(err);
//        var existingImage = {
//          path: testUtil.uploadedImageNameToPath(reqImage.name),
//          content: 'existing image'
//        };
//        fs.writeFileSync(existingImage.path, existingImage.content);
//
//        callSaveEvent(testUtil.buildTestEvent({images: [reqImage]}))
//          .expect(isOk)
//          .end(function(err, res) {
//            if (err) return done(err);
//            var savedImage = res.body.event.images[0];
//            testUtil.uploadedImageNameToPath(savedImage.name).should.not.equal(existingImage.path);
//            path.extname(savedImage.name).should.equal(path.extname(reqImage.name));
//            done();
//          });
//      });
//    });
    it('should prevent directory traversal attack', function(done) {
      createLogo(function(err, image) {
        image.name = '../../passwd';
        callSaveEvent(testUtil.buildTestEvent({images: [image]}))
          .expect(400)
          .end(done);
      });
    });
  });
  describe('update-event', function() {
    it('should save image on update', function(done) {
      async.series([createLogo, createImage], function(err, images) {
        if (err) return done(err);

        createEvent(testUtil.buildTestEvent(), function(err, event) {
          if (err) return done(err);
          updateEvent(event, images[0]);
        });
      });
      function updateEvent(event, image) {
        callSaveEvent(_.extend(event, {images: [image]}))
          .expect(isOk)
          .end(function(err, res) {
            if (err) return done(err);
            res.body.event._id.should.equal(event._id);
            res.body.event.images.length.should.equal(1);
            done();
          });
      }
    });
    it('should update logo', function(done) {
      async.series([createLogo, createImage], function(err, images) {
        if (err) return done(err);

        createEvent(testUtil.buildTestEvent({images: images}), function(err, event) {
          if (err) return done(err);
          updateEvent(event);
        });
      });
      function findLogo(images) {
        return _.findWhere(images, {isLogo: true});
      }
      function updateEvent(event) {
        event.images[0].isLogo = !event.images[0].isLogo;
        event.images[1].isLogo = !event.images[1].isLogo;
        var expectedLogoId = findLogo(event.images)._id;
        callSaveEvent(event)
          .expect(isOk)
          .end(function(err, res) {
            if (err) return done(err);
            res.body.event.images.length.should.equal(2);
            findLogo(res.body.event.images)._id.should.equal(expectedLogoId);
            done();
          });
      }
    });
    it('should validate activity by enum', function(done) {
      createEvent(testUtil.buildTestEvent(), function(err, event) {
        if (err) return done(err);
        updateEvent(event);
      });
      function updateEvent(event) {
        event.activity = 'unknown';
        callSaveEvent(event)
          .expect(400)
          .end(done);
      }
    });
  });

  function createEvent(reqData, cb) {
    callSaveEvent(reqData)
      .expect(isOk)
      .end(function(err, res) {
        if (err) return cb(err);
        cb(null, res.body.event);
      });
  }

  function isOk(res) {
    if (!(res.status == 200)) {
      return 'Expected 200, but got ' + res.status + '. Response body: ' + JSON.stringify(res.body);
    }
  }

  function createLogo(opts, cb) {
    if (!cb) {
      cb = opts;
      opts = null;
    }
    opts = mergeArgs(opts, testImageOpts, testImageOpts);
    testUtil.createLogoImage(opts, cb);
  }
  function createImage(opts, cb) {
    if (!cb) {
      cb = opts;
      opts = null;
    }
    opts = mergeArgs(opts, testImageOpts, testImageOpts);
    testUtil.createImage(opts, cb);
  }
  function mergeArgs(arg1, arg2, defaultValue) {
    if (arg1 && arg2) {
      return _.merge(arg1, arg2);
    } else {
      return defaultValue;
    }
  }
});
