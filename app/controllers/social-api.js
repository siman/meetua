'use strict';

var secrets = require('../../config/app-config').secrets;
var User = require('../models/User');
var async = require('async');
var request = require('request');
var _ = require('underscore');
var graph = require('fbgraph');
var logger = require('./util/logger')(__filename);

function _updateFbFriends(user) {
  var errMsg = 'Failed to update FB friends of user ' + user.email;
  loadFbFriendsThatAreMeetUaUsers(user, function(err, fbFriendIds) {
    if (err) return logger.warn(errMsg, err);
    // Remove all FB friends that current user already has in friends.
    var onlyNewFbFriendIds = _.reject(fbFriendIds, function(fbFriendId) {
      return _.find(user.profile.friends, function(userFriendId) {
        return userFriendId.equals(fbFriendId);
      });
    });
    // Then append all new FB friends found with FB-graph.
    user.profile.friends = user.profile.friends.concat(onlyNewFbFriendIds);
    user.save(function(err) {
      if (err) return logger.warn(errMsg, err);
      logger.info('Saved new', fbFriendIds && fbFriendIds.length || 0, 'FB friends to user', user.email);
    });
  });
}

function loadFbFriendsThatAreMeetUaUsers(user, cb) {
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
      }, function(err, userIds) {
        if (err) return cb(err, userIds);
        if (!userIds) return cb(err, userIds);
        userIds = _.filter(userIds, function(user) { return user; });
        logger.debug('Mapped', friends.length, 'FB friends of current user to',
          userIds.length, 'MeetUA existing users'
        );
        cb(err, userIds);
      });
    }
  ], function done(err, users) {
    if (err) return cb(err);
    cb(null, users);
  });
}

exports.updateFbFriends = _updateFbFriends;