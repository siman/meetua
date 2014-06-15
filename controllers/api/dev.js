'use strict';
/**
 * Created by oleksandr at 6/15/14 3:54 PM
 */
var EventStore = require('../event/EventStore');
var notifyService = require('../util/notification-service');

exports.postNotifyParticipantOnJoin = function(req, res, next) {
  EventStore.findById(req.body.eventId, '', function(err, event) {
    if (err) return next(err);
    notifyService.notifyParticipantOnJoin(req.user, event, function(err) {
      if (err) return res.send(500, err);
      res.send(200, 'sent');
    });
  });
};