'use strict';

var logger = require('../../controllers/util/logger')(__filename);
var _ = require('lodash');
var Event = require('../../models/Event');
var ObjectId = require('mongoose').Types.ObjectId;
var findAction = require('./find-action');

module.exports.countByActivity = function(cb) {
  var cond = findAction.buildFindCondition({
//    passed: false, // TODO: Uncomment once ISODate is fixed
    canceled: false
  });
  logger.debug('Cond', cond);
  var group = {
    key: {activity: 1},
    cond: cond,
    initial: {count: 0},
    reduce: function(curr, result) {
      result.count++;
    },
    finalize: function(res) {}
  };
  Event.collection.group(group.key, group.cond,
    group.initial, group.reduce, group.finalize, true,
    function(err, res) {
      logger.debug('group results', res);
      cb(err, res);
    }
  );
};