/**
 * Created by oleksandr on 9/14/14.
 */
'use strict';

var eventsService = require('../services/events');
var _ = require('lodash');
var Event = require('../models/Event');

/**
 * Keep our controllers 'thin'.
 * @see {@link http://sailsjs.org/#/documentation/concepts/Controllers?q=thin-controllers}
 */
module.exports = {
  countByActivity: function(req, res, next) {
    eventsService.countByActivity(function(err, eventCounts) {
      res.json(200, eventCounts);
    });
  },
  eventById: function(req, res, next, eventId) {
    eventsService.eventById(eventId, function(err, event) {
      if (err) return next(err);
      req.eventById = event;
      next();
    });
  },
  save: function(req, res) {
    var args = {
      params: req.body,
      isCreate: _.isUndefined(req.body._id),
      currentUser: req.user,
      flashFn: req.flash.bind(req) };
    eventsService.save(args, returnJson(res));
  },
  cancel: function(req, res) {
    eventsService.cancel(req.user, req.eventById, returnJson(res));
  },
  getEvent: function(req, res) {
    res.json({event: req.eventById});
  },
  find: function(req, res) {
    var args = {
      activities: req.query.activities,
      participantId: req.query.participantId,
      authorId: req.query.authorId,
      canceled: req.query.canceled,
      passed: req.query.passed,
      limit: req.query.limit
    };
    eventsService.find(args, returnJson(res));
  }
};

function returnJson(res) {
  return function doReturn(status, data) {
    res.json(status, data);
  }
}