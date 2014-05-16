var testUtil = require('../../test-util');
var dbPreload = require('../../../controllers/user').dbPreload;
var mockUsers = require('../../../controllers/user-mock-store');
var User = require('../../../models/User');
var _ = require('underscore');

describe('user controller', function() {
  beforeEach(testUtil.mongoConnect);
  afterEach(testUtil.mongoDisconnect);

  it('should preload mock users in db when it\'s empty', function(done) {
    removeAllUsers(function(err) {
      if (err) return done(err);
      doPreload();
    });
    function doPreload() {
      dbPreload(function onPreloaded() {
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
      dbPreload(function onPreloaded() {
        User.count(function(err, usersCount) {
          if (err) return done(err);
          expect(usersCount).toBe(1);
          done();
        });
      });
    }
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