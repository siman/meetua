'use strict';

var secrets = require('../../config/app-config').secrets;
var User = require('../models/User');
var querystring = require('querystring');
var validator = require('validator');
var async = require('async');
var request = require('request');
var _ = require('underscore');
var graph = require('fbgraph');
var logger = require('./util/logger')(__filename);

function _updateFbFriends(user) {
  var errMsg = 'Failed to update friends of user ' + user.email;
  loadFbFriends(user, function(err, friends) {
    if (err) return logger.warn(errMsg, err);
    user.profile.friends = friends;
    user.save(function(err) {
      if (err) return logger.warn(errMsg, err);
      logger.info('Saved ', friends && friends.length || 0, 'friends of user', user.email);
    });
  });
}

function loadFbFriends(user, cb) {
  var userFbId = user.facebook;
  var fbToken = _.findWhere(user.tokens, { kind: 'facebook' });
  logger.debug('fbAccessToken', fbToken, 'userFbId', userFbId);
  async.waterfall([
    function loadGraph(cb) {
      graph.setAccessToken(fbToken.accessToken);
      graph.get(userFbId + '/friends', function(err, friends) {
        if (err) return cb(err, friends);
        if (!friends || !friends.data) return cb(err, friends);
        logger.debug('Loaded fbgraph:/friends:', friends.data.length, 'userFacebookId', userFbId);
        cb(err, friends.data);
      });
    },
    function mapToUsers(friends, cb) {
      if (!friends) return cb();
      async.map(friends, function(friend, cbmap) {
        User.findOne({'facebook': friend.id}).select('_id').exec(cbmap);
      }, function(err, users) {
        if (err) return cb(err, users);
        if (!users) return cb(err, users);
        users = _.filter(users, function(user) { return user });
        logger.debug('Mapped', friends.length, 'fbfriends to', users.length, 'users');
        cb(err, users);
      });
    }
  ], function done(err, users) {
    if (err) return cb(err);
    cb(null, users);
  });
}

exports.updateFbFriends = _updateFbFriends;