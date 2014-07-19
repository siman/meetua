var mongoose = require('mongoose');
var fs = require('fs-extra');
var flash = require('express-flash');
var path = require('path');
var tmp = require('tmp');
var os = require('os');
tmp.setGracefulCleanup();
var request = require('supertest');
var express = require('express');
var Event = require('../../../../app/models/Event');
var testUtil = require('../../test-util');
var _ = require('underscore');
var config = require('../../../../config/app-config'); // patches mongoose
var async = require('async');
var notificationService = require('../../../../app/controllers/util/notification-service');
notificationService.notifyAuthorOnCreate = function(arg, cb) {cb();}; // mock
notificationService.notifyParticipantOnEdit = function(arg, cb) {cb();}; // mock
var moment = require('moment');

var saveEvent = require('../../../../app/controllers/event/save-event');

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
  app.post('/event/save', saveEvent);
  app.use(testUtil.errorHandler);

  beforeEach(testUtil.mongoConnect);
  afterEach(testUtil.mongoDisconnect);

  function callSaveEvent(reqData) {
    return request(app)
      .post('/event/save')
      .send(reqData);
  }

  describe('create-event', function() {
    it('should save event to the database', function(done) {
      callSaveEvent(testUtil.buildTestEvent())
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          Event.findOne({_id: res.body.event._id }, function(err, doc) {
            expect(doc).toBeDefined();
            done();
          })
        });
    });
    it('should sanitize description', function(done) {
      callSaveEvent(testUtil.buildTestEvent({description: '<p><script>alert("XSS");</script><b>Text</b></p>'}))
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          Event.findOne({_id: res.body.event._id }, function(err, doc) {
            expect(doc).toBeDefined();
            expect(doc.description).toEqual('<p><b>Text</b></p>');
            done();
          })
        });
    });
    it('should save event when latitude and longitude not selected', function(done) {
      callSaveEvent(testUtil.buildTestEvent({ place:{ name: 'Malibu', latitude: undefined, longitude: undefined }}))
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          Event.findOne({_id: res.body.event._id }, function(err, doc) {
            expect(doc).toBeDefined();
            done();
          })
        });
    });
    it('should move image to the new dir creating dest dir if necessary', function(done) {
      testUtil.createTestImage({isLogo: true}, function(reqImage) {
        fs.removeSync(config.EVENT_IMG_DIR);

        callSaveEvent(testUtil.buildTestEvent({images: [reqImage]}))
          .expect(200)
          .end(function(err, res) {
            if (err) return done(err);
            var copiedImage = res.body.event.images[0];
            expect(copiedImage.originalName).toBe(reqImage.originalName);
            expect(copiedImage.type).toBe(reqImage.type);
            expect(fs.existsSync(testUtil.savedImageNameToPath(copiedImage.name))).toBe(true);
            expect(fs.existsSync(testUtil.uploadedImageNameToPath(reqImage.name))).toBe(false);
            done();
          });
      });
    });
    it('should forbid multiple logos', function(done) {
      async.parallel([testUtil.createLogoImage, testUtil.createLogoImage], function(err, images) {
        callSaveEvent(testUtil.buildTestEvent({images: images}))
          .expect(400)
          .end(done);
      });
    });
    it('should generate unique name for image in the new dir and preserve file extension', function(done) {
      testUtil.createTestImage({isLogo: true}, {postfix: '.jpg'}, function(reqImage) {
        var existingImage = {
          path: testUtil.uploadedImageNameToPath(reqImage.name),
          content: 'existing image'
        };
        fs.writeFileSync(existingImage.path, existingImage.content);

        callSaveEvent(testUtil.buildTestEvent({images: [reqImage]}))
          .expect(200)
          .end(function(err, res) {
            if (err) return done(err);
            var savedImage = res.body.event.images[0];
            expect(testUtil.uploadedImageNameToPath(savedImage.name)).not.toBe(existingImage.path);
            expect(path.extname(savedImage.name)).toBe(path.extname(reqImage.name));
            done();
          });
      });
    });
    it('should prevent directory traversal attack', function(done) {
      testUtil.createLogoImage(function(err, image) {
        image.name = '../../passwd';
        callSaveEvent(testUtil.buildTestEvent({images: [image]}))
          .expect(400)
          .end(done);
      });
    });
  });
  describe('update-event', function() {
    it('should save image on update', function(done) {
      async.series([testUtil.createLogoImage, testUtil.createImage], function(err, images) {
        if (err) return done(err);

        createEvent(testUtil.buildTestEvent(), function(err, event) {
          if (err) return done(err);
          updateEvent(event, images[0]);
        });
      });
      function updateEvent(event, image) {
        callSaveEvent(_.extend(event, {images: [image]}))
          .expect(200)
          .end(function(err, res) {
            if (err) return done(err);
            expect(res.body.event._id).toBe(event._id);
            expect(res.body.event.images.length).toBe(1);
            done();
          });
      }
    });
    it('should update logo', function(done) {
      async.series([testUtil.createLogoImage, testUtil.createImage], function(err, images) {
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
          .expect(200)
          .end(function(err, res) {
            if (err) return done(err);
            expect(res.body.event.images.length).toBe(2);
            expect(findLogo(res.body.event.images)._id).toBe(expectedLogoId);
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
      .expect(200)
      .end(function(err, res) {
        if (err) return cb(err);
        cb(null, res.body.event);
      });
  }

});
