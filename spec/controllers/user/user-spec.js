var testUtil = require('../../test-util');
var passport = require('passport');
var passportConfig = require('../../../config/passport');
var user = require('../../../controllers/user');
var mockUsers = require('../../../controllers/user-mock-store');
var User = require('../../../models/User');
var _ = require('underscore');
var request = require('supertest');
var express = require('express');
var expressValidator = require('express-validator');

describe('user controller', function() {
  beforeEach(testUtil.mongoConnect);
  afterEach(testUtil.mongoDisconnect);

  var app = express();
  app.use(express.bodyParser());
  app.use(expressValidator());
  app.use(passport.initialize());
  app.use(passport.session());
  app.post('/login', user.api.postLoginRest);

  it('should preload mock users in db when it\'s empty', function(done) {
    removeAllUsers(function(err) {
      if (err) return done(err);
      doPreload();
    });
    function doPreload() {
      user.dbPreload(function onPreloaded() {
        User.count(function(err, usersCount) {
          if (err) return done(err);
          expect(usersCount).toBe(mockUsers.length);
          done();
        });
      });
    }
  });

  it('should not preload mock users when there are users in the db', function(done) {
    removeAllUsers(function(err) {
      if (err) return done(err);
      new User(mockUsers[0]).save(function(err, createdUser) {
        doPreload();
      });
    });
    function doPreload() {
      user.dbPreload(function onPreloaded() {
        User.count(function(err, usersCount) {
          if (err) return done(err);
          expect(usersCount).toBe(1);
          done();
        });
      });
    }
  });

  describe('postLoginRest', function() {
    var mockUser = mockUsers[0];
    it('should login', function(done) {
      request(app)
        .post('/login')
        .send({ email: mockUser.email, password: mockUser.password })
        .expect(200)
        .end(function(err, resp) {
          if (err) return done(err);
          var user = resp.body.user;
          expect(user.email).toBe(mockUser.email);
          expect(user.name).toBe(mockUser.name);
          done();
        });
    });
    it('validate', function(done) {
      request(app)
        .post('/login')
        .send({ email: 'invalid-email', password: '' })
        .expect(400)
        .end(function(err, resp) {
          if (err) return done(err);
          expect(resp.body.email).toBeDefined();
          expect(resp.body.password).toBeDefined();
          done();
        });
    });
    it('check email', function(done) {
      request(app)
        .post('/login')
        .send({ email: 'some@mail.com', password: mockUser.password })
        .expect(400)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body.user).toBeDefined();
          done();
        });
    });
    it('check password', function(done) {
      request(app)
        .post('/login')
        .send({ email: mockUser.email, password: 'invalid password' })
        .expect(400)
        .end(done);
    });
  });
});

function removeAllUsers(cb) {
  User.find({}, function(err, users) {
    if (err) return cb(err);
    _.each(users, function(user) {
      user.remove();
    });
    cb(null);
  });
}