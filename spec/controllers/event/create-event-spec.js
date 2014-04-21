var mongoose = require('mongoose');
var fs = require('fs-extra');
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
config.UPLOAD_DIR = os.tmpDir();
config.EVENT_IMG_DIR = path.join(os.tmpDir(), 'event-imgs');

var createEvent = require('../../../controllers/event/create-event');

describe('create-event', function() {
    var user = { _id: mongoose.Types.ObjectId() };
    var app = express();
    app.use(express.bodyParser());
    app.use(testUtil.reqUser(user));
    app.post('/event/create', createEvent);
    app.use(testUtil.errorHandler);

    beforeEach(testUtil.mongoConnect);
    afterEach(testUtil.mongoDisconnect);

    function callCreateEvent(reqData) {
        return request(app)
            .post('/event/create')
            .send(reqData);
    }

    it('should save event to the database', function(done) {
        callCreateEvent(buildReqData())
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
        tmp.file(function(err, filePath, fd) {
            var content = new Buffer('image content');
            var reqImage = {
                path: filePath,
                type: 'image/jpg',
                name: 'my-image.jpg'
            };
            fs.writeSync(fd, content, 0, content.length, 0);
            fs.removeSync(config.EVENT_IMG_DIR);

            callCreateEvent(buildReqData({images: [reqImage]}))
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
});

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