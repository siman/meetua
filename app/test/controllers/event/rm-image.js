'use strict';
var chai = require('chai');
var should = chai.should();
var testUtil = require('../../../spec/test-util');
var rmImage = require('../../controllers/event/rm-image');
var request = require('supertest');
var appConfig = require('../../../../config/app-config');
var app = require('../../app.js');
var mockEvents = require('../../../../app/controllers/event/MockEvents');
var mockUsers = require('../../../../app/controllers/user-mock-store');

/**
 * Created by oleksandr at 7/15/14 10:22 PM
 */
describe('rm-image tests', function() {
  var cookie;
  var user1;
  beforeEach(function(done) {
    var request = require('superagent');
    user1 = request.agent();
    user1
      .post('http://localhost:3000/api/meetua/user/login')
      .send({email: mockUsers[0].email, password: mockUsers[0].password})
      .end(function(err, res) {
        // user1 will manage its own cookies
        // res.redirects contains an Array of redirects
        done();
      });
/*    request(app)
      .post('/api/meetua/user/login')
      .send({email: mockUsers[0].email, password: mockUsers[0].password})
      .end(function(err, res) {
        res.should.have.status(200);
        cookie = res.headers['set-cookie'];
        done();
      });*/
  });
  it('allow rm images for only user\'s own events', function(done) {
    user1
      .get('/event/' + mockEvents[0]._id + '/rm-image/TODO:imageId')
      .end(function(err, res) {
        res.status.should.equal(200);
        done(err);
      });
  })
});