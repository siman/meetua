/**
 * Created by oleksandr on 9/20/14.
 */
'use strict';
var Event = require('../../models/Event');
var ObjectId = require('mongoose').Types.ObjectId;

/**
 * @param {Object} args
 * @param {Event} args.eventById
 * @param {String} args.act
 * @param {ObjectId} args.participantId
 * @param {Number} args.limit
 * @param cb function(status, data)
 * @returns {*}
 */
module.exports = function(args, cb) {
  if (args.eventById) { // simple get by id
    cb({event: args.eventById});
  } else {
    var activity = args.act;
    var participantId = args.participantId;
    var filter = {
      'start.dateTime': {$gt:  Date.now()},
      canceledOn: {$exists: false}
    };
    var limit = args.limit;
    if (activity) {
      filter.activity = activity;
    }
    if (participantId) {
      filter.participants = {$elemMatch: {user:ObjectId(participantId)}};
    }
    var q = Event.find(filter);
    if (limit) {
      q = q.limit(limit);
    }
    return q.exec(function(err, events) {
      if (err) return next(err);
      cb(200, events);
    });
  }
};