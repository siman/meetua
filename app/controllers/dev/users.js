'use strict';

/**
 * Created by Alex on 9/14/14.
 */

var User = require('../../../app/models/User');

exports.list = function(req, res, next) {
  User.find({}, function(err, users) {
    if (err) return res.json(500, err);
    res.json(200, users);
  });
};