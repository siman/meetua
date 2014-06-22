'use strict';
/**
 * Created by oleksandr at 6/15/14 3:54 PM
 */
var EventStore = require('../event/EventStore');
var notifyService = require('../util/notification-service');

exports.postNotifyParticipantOnJoin = notify(function(user, event, cb) {
  notifyService.notifyParticipantOnJoin(user, event, cb);
});

exports.postNotifyParticipantOnEdit = notify(function(user, event, cb) {
  notifyService.notifyParticipantOnEdit(event, cb)
});

function notify(notifyFn) {
  return function(req, res, next) {
    EventStore.findById(req.body.eventId, '', function(err, event) {
      if (err) return next(err);
      notifyFn(req.user, event, function(err) {
        if (err) return next(err);
        res.send(200, 'sent');
      });
    });
  };
}