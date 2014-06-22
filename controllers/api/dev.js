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

exports.postNotifyUserForgotPassword = function(req, res, next) {
  notifyService.notifyUserForgotPassword(req.user, 'mock-token', sentCb(req, res, next));
};

exports.postNotifyUserPasswordReset = function(req, res, next) {
  notifyService.notifyUserPasswordReset(req.user, sentCb(req, res, next));
};

exports.postNotifyAuthorOnCreate = notify(function(user, event, cb) {
  notifyService.notifyAuthorOnCreate(event, cb);
});

exports.postNotifyComingSoonEvent = notify(function(user, event, cb) {
  notifyService.notifyComingSoonEvent(event);
  cb();
});

exports.postNotifyOnCancel = notifyCanceled(function(user, event, cb) {
  notifyService.notifyOnCancel(event, cb);
});


function notify(notifyFn) {
  return function(req, res, next) {
    EventStore.findById(req.body.eventId, '', function(err, event) {
      if (err) return next(err);
      notifyFn(req.user, event, sentCb(req, res, next));
    });
  };
}

function notifyCanceled(notifyFn) {
  return function(req, res, next) {
    EventStore.findCanceledById(req.body.eventId, '', function(err, event) {
      if (err) return next(err);
      notifyFn(req.user, event, sentCb(req, res, next));
    });
  };
}

function sentCb(req, res, next) {
  return function(err) {
    if (err) return next(err);
    res.send(200, 'sent');
  };
}