'use strict';
var chai = require('chai');
var should = chai.should();
var testUtil = require('../../../spec/test-util');
testUtil.initDb();
var app = require('../../app.js');
var appConfig = require('../../../../config/app-config');
var mockUsers = require('../../../../app/controllers/user-mock-store');

/**
 * Created by oleksandr at 7/15/14 10:22 PM
 */
describe('[rm-image] ', function() {
  var user1Req;
  var user2Req;
  beforeEach(function(done) {
    testUtil.loginUser(mockUsers[0], function(req) {
      user1Req = req;
      testUtil.loginUser(mockUsers[1], function(req) {
        user2Req = req;
        done();
      });
    });
  });
  it('allow rm images for only user\'s own events', function(done) {
    testUtil.createLogoImage(function(err, image) {
      if (err) return done(err);
      var event = testUtil.buildTestEvent({images: [image]});
      user1Req
        .post(appConfig.hostname + '/api/meetua/events')
        .send(event)
        .end(function(err, res) {
          res.status.should.equal(200);
          rmImage(res.body.event._id, res.body.event.images[0]._id);
        });
    });
    function rmImage(eventId, imageId) {
      user2Req
        .post(appConfig.hostname + '/event/' + eventId + '/rm-image/' + imageId)
        .end(function(err, res) {
          res.status.should.equal(403);
          done(err);
        });
    }
  })
});