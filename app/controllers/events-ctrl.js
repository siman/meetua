/**
 * Created by oleksandr on 9/14/14.
 */
'use strict';

var eventsService = require('../services/events');
var _ = require('lodash');
var Event = require('../models/Event');
var utils = require('./util/utils');

/**
 * Keep our controllers 'thin'.
 * @see {@link http://sailsjs.org/#/documentation/concepts/Controllers?q=thin-controllers}
 */
module.exports = {
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
    eventsService.save(args, utils.sendJson(res));
  },
  cancel: function(req, res) {
    eventsService.cancel(req.user, req.eventById, utils.sendJson(res));
  },
  getEvent: function(req, res) {
    res.json({event: req.eventById});
  },
  find: function(req, res) {
    var args = {
      act: req.query.act,
      participantId: req.query.participantId,
      authorId: req.query.authorId,
      canceled: req.query.canceled,
      passed: req.query.passed,
      limit: req.query.limit};
    eventsService.find(args, utils.sendJson(res));
  }
};