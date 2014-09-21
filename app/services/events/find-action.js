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
 * @param {String} args.act
 * @param {ObjectId} args.participantId
 * @param {Boolean} args.authorId
 * @param {Boolean} args.passed
 * @param {Boolean} args.canceled
 * @param {Number} args.limit
 */
exports.findQuery = function(args) {
  var activity = args.act;
  var participantId = args.participantId;
  var startDateTime = !_.isUndefined(args.passed) ? args.passed ? {$gt: Date.now()} : {$lte: Date.now()} : undefined;
  var filter = {};
  if (startDateTime) {
    filter.start = {};
    filter.start.dateTime = startDateTime;
  }
  if (!_.isUndefined(args.canceled)) {
    filter.canceledOn = {$exists: !!args.canceled}
  }
  if (activity) {
    filter.activity = activity;
  }
  if (participantId) {
    filter.participants = {$elemMatch: {user: ObjectId(participantId)}};
  }
  if (args.authorId) {
    filter.author = ObjectId(args.authorId);
  }
  var res = {filter: filter};
  if (args.limit) {
    res.limit = args.limit;
  }
  return  res;
};

exports.find = function(args, cb) {
  try {
    var findQuery = exports.findQuery(args, function() {});
    var q = Event.find(findQuery.filter);
    if (findQuery.limit) {
      q.limit(findQuery.limit);
    }
    return q.exec(function(err, events) {
      if (err) return cb(err);
      cb(200, events);
    });
  } catch(e) {
    cb(500, e);
  }
};