'use strict';

var Event = require('../../models/Event');
var _ = require('underscore');
var notificationService = require('../../controllers/util/notification-service');
var logger = require('../../controllers/util/logger')(__filename);

/**
 * @param {User} user
 * @param {Event} event
 * @param {Function} cb function(status, data)
 */
module.exports = function (user, event, cb) {
  logger.debug('cancel event');
  if (!user) return cb(403);
  if (!event) return cb(404);

  event.canceledOn = new Date();
  event.save(afterSave);
  function afterSave() {
    notificationService.notifyOnCancel(event, function sendResponse(err) {
      if (err) return cb(500, err);
      return cb(200, {msg: 'Событие ' + event.name + ' успешно отменено.', event: event});
    });
  }
};