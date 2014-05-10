var mongoose = require('mongoose');
var fs = require('fs-extra');
var flash = require('express-flash');
var path = require('path');
var tmp = require('tmp');
var os = require('os');
tmp.setGracefulCleanup();
var request = require('supertest');
var express = require('express');
var Event = require('../../../models/Event');
var testUtil = require('../../test-util');
var _ = require('underscore');
var config = require('../../../config/app-config');
var async = require('async');
config.UPLOAD_DIR = os.tmpDir();
config.EVENT_IMG_DIR = path.join(os.tmpDir(), 'event-imgs');

var saveEvent = require('../../../controllers/event/save-event');

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
      callSaveEvent(buildReqData())
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

        callSaveEvent(buildReqData({images: [reqImage]}))
          .expect(200)
          .end(function(err, res) {
            if (err) return done(err);
            var copiedImage = res.body.event.images[0];
            expect(copiedImage.name).toBe(reqImage.name);
            expect(copiedImage.type).toBe(reqImage.type);
            expect(fs.existsSync(copiedImage.path)).toBe(true);
            expect(fs.existsSync(reqImage.path)).toBe(false);
            done();
          });
      });
    });
    it('should forbid multiple logos', function(done) {
      async.parallel([createLogoImage, createLogoImage], function(err, images) {
        callSaveEvent(buildReqData({images: images}))
          .expect(400)
          .end(done);
      });
    });
    it('should generate unique name for image in the new dir and preserve file extension', function(done) {
      tmp.file({postfix: '.jpg'}, function(err, filePath, fd) {
        var content = new Buffer('image content');
        var reqImage = {
          path: filePath,
          type: 'image/jpg',
          name: 'my-image.jpg',
          isLogo: true
        };
        fs.writeSync(fd, content, 0, content.length, 0);

        var existingImage = {
          path: path.join(config.EVENT_IMG_DIR, path.basename(reqImage.path)),
          content: 'existing image'
        };
        fs.writeFileSync(existingImage.path, existingImage.content);

        callSaveEvent(buildReqData({images: [reqImage]}))
          .expect(200)
          .end(function(err, res) {
            if (err) return done(err);
            var savedImage = res.body.event.images[0];
            expect(savedImage.path).not.toBe(existingImage.path);
            expect(path.extname(savedImage.path)).toBe(path.extname(reqImage.path));
            done();
          });
      });
    });
  });
  describe('update-event', function() {
    it('should update event', function(done) {
      async.series([createLogoImage, createImage], createEvent);

      function createEvent(err, images) {
        if (err) return done(err);

        callSaveEvent(buildReqData({images: [images[0]/*logo*/]}))
          .expect(200)
          .end(function(err, res) {
            if (err) return done(err);
            updateEvent(res.body.event, images);
          });
      }
      function updateEvent(event, images) {
        callSaveEvent(_.extend(event, {images: images}))
          .expect(200)
          .end(function(err, res) {
            if (err) return done(err);
            expect(res.body.event.images.length).toBe(2);
            done();
          });
      }
    });
  });
});

function createImage(next) {
  testUtil.createTestImage({isLogo: false}, function(image) {
    next(null, image);
  });
}
function createLogoImage(next) {
  testUtil.createTestImage({isLogo: true}, function(image) {
    next(null, image);
  });
}

function buildReqData(opts) {
  var reqData = {
    name: 'pokatushka',
    place: {
      name: 'Kiev- stalica!',
      latitude: 49,
      longitude: 50
    },
    start: {
      date: new Date(),
      time: new Date()
    },
    end: {
      date: new Date(),
      time: new Date()
    },
    description: 'event description',
    activity: 'bike',
    images: []
  };
  return _.extend(reqData, opts);
}