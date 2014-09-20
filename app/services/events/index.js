/**
 * Created by oleksandr on 9/14/14.
 */
'use strict';

var saveAction = require('./save-action');
var cancelAction = require('./cancel-action');
var findAction = require('./find-action');
var Event = require('../../models/Event');

/**
 * Encapsulates internal implementation, so it's easy to refactor it. Also may keep common logic for event actions.
 */
module.exports = {
  save: saveAction,
  cancel: cancelAction,
  find: findAction,
  eventById: function(eventId, cb) {
    Event.findById(eventId).populate("participants.user").exec(function(err, event) {
      if (err) return cb(err);
      if (!event) return cb(new Error('Не удалось найти событие'));
      cb(null, event);
    })
  }
};