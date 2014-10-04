'use strict';

/**
 * Created by Alex on 9/14/14.
 */

var logger = require('../util/logger')(__filename);
var User = require('../../../app/models/User');
var _ = require('lodash');

exports.list = function(req, res, next) {
  User.find({}, function(err, users) {
    if (err) return res.json(500, err);
    res.json(200, users);
  });
};

exports.changeFriendship = function(req, res, next) {
  User.findOne({_id: req.params.userId}, function(err, user) {
    if (err) return res.json(500, err);

    var currentFriends = req.user.profile.friends;
    var alreadyFriend = _.find(currentFriends, function(friend) {
      return friend._id.equals(user._id);
    });

    if (!alreadyFriend) {
      currentFriends.push(user);
    } else {
      req.user.profile.friends = _.reject(currentFriends, function(friend) {
        return friend._id.equals(user._id);
      });
    }

    req.user.save(function(err, savedCurrentUser) {
      if (err) return res.json(500, err);
      res.json(200, {currentUser: savedCurrentUser});
    });
  });
};