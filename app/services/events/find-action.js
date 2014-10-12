/**
 * Created by oleksandr on 9/20/14.
 */
'use strict';
var Event = require('../../models/Event');
var ObjectId = require('mongoose').Types.ObjectId;
var logger = require('../../controllers/util/logger')(__filename);
var _ = require('lodash');

/**
 * @param {Object} args
 * @param {String} args.activities
 * @param {ObjectId} args.participantId
 * @param {Boolean} args.authorId
 * @param {Boolean} args.passed
 * @param {Boolean} args.canceled
 * @param {Number} args.limit
 */
exports.findQuery = function(args) {
  var activities = args.activities;
  var participantId = args.participantId;
  var filter = {};
  var startDateTime = undefined;
  var now = Date.now();
  if (!_.isUndefined(args.passed)) {
    // TODO: Check also end date that it is <= now. issue #171
    startDateTime = args.passed === true || args.passed === 'true' ? {$lte: now} : {$gt: now}
  }
  if (startDateTime) {
    filter['start.dateTime'] = startDateTime;
  }
  if (!_.isUndefined(args.canceled)) {
    filter.canceledOn = {$exists: args.canceled === true || args.canceled === 'true'}
  }
  if (activities) {
    if (_.isArray(activities)) {
      filter.activity = {$in: activities};
    } else {
      filter.activity = activities; // Look by single activity
    }
  }
  if (participantId) {
    filter['participants.user'] = ObjectId(participantId);
  }
  if (args.authorId) {
    filter.author = ObjectId(args.authorId);
  }
  var res = {filter: filter, sort: {'start.dateTime': 1}};
  if (args.limit) {
    res.limit = args.limit;
  }
  return  res;
};

// TODO: Add pagination. issue #170
exports.find = function(args, cb) {
  try {
    var findQuery = exports.findQuery(args, function() {});
    var q = Event.find(findQuery.filter);
    if (findQuery.limit) {
      q.limit(findQuery.limit);
    }
    if (findQuery.sort) {
      q.sort(findQuery.sort);
    }
    return q.exec(function(err, events) {
      logger.debug(args, '->', findQuery, '->', events && events.length || 0);
      if (err) return cb(err);
      cb(200, events);
    });
  } catch(e) {
    logger.error('Failure during find-action', e.stack);
    cb(500, e);
  }
};