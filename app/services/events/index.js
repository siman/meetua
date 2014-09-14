/**
 * Created by oleksandr on 9/14/14.
 */
'use strict';

var saveAction = require('./save-action');
var cancelAction = require('./cancel-action');
var Event = require('../../models/Event');

/**
 * Encapsulates internal implementation, so it's easy to refactor it. Also may keep common logic for event actions.
 */
module.exports = {
  save: saveAction,
  cancel: cancelAction,
  eventById: function(req, eventId, next) {
    Event.findById(eventId, function(err, event) {
      if (err) return next(err);
      if (!event) return next(new Error('Не удалось найти событие'));
      req.eventById = event;
      next();
    })
  }
};