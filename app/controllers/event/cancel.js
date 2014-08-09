'use strict';

var Event = require('../../models/Event');
var _ = require('underscore');
var notificationService = require('../util/notification-service');
var logger = require('../util/logger')('cancel.js');

module.exports = function (req, res, next) {
  logger.debug('cancel event');
  if (!req.user) return res.send(403);

  var eventId = req.params.id;
  if (!eventId) return res.send(404);

  Event.findOne({_id: eventId, author: req.user._id}, function (err, event) {
    if (err) return next(err);
    if (!event) return res.send(404);

    event.canceledOn = new Date();

    event.save(afterSave);
    function afterSave() {
      notificationService.notifyOnCancel(event, function sendResponse(err) {
        if (err) return next(err);
        res.render('event/canceled', {
            title: 'Отмена события',
            event: event
          }
        );
      });
    }
  });
};