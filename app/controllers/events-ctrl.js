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
  find: function(req, res) {
    var args = {
      eventById: req.eventById,
      act: req.query.act,
      participantId: req.query.participantId,
      limit: req.query.limit};
    eventsService.find(args, returnJson(res));
  }
};

function returnJson(res) {
  return function doReturn(status, data) {
    res.json(status, data);
  }
}