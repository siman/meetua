/**
 * Created by oleksandr on 9/5/14.
 */

var EventStore = require('./event-store');
var Notifier = require('../util/notification-service');
var logger = require('../util/logger')(__filename);
var _ = require('underscore');

/** Change participation status for event. */
module.exports.post_participation = function(req, res, next) {
  var params = req.body;
  var eventId = params.eventId;
  var act = params.act || 'add'; // valid values: add, remove.
  var curUser = req.user;
  logger.debug('post_participation eventId: ' + eventId + ' act ' + act + ' curUser ' + curUser);

  EventStore.findById(eventId, [], function(err, event) {
    logger.debug('event found result: err ' + err + ' event ' + event);
    if (err) {
      return next(err);
    }

    function updateEvent(status) {
      event.save(function(err) {
        logger.debug('event save result: err ' + err);
        if (err) return next(err);

        if (status == 'added') {
          Notifier.notifyParticipantOnJoin(curUser, event, function sendResponse(err) {
            if (err) {
              logger.debug('notify result: err', err);
              return res.json(500, new Error('Не удалось отправить уведомление Вам на почту.'));
            }
            return res.json({status: status})
          });
        } else {
          res.json({status: status});
        }
      });
    }

    // TODO: Disallow to change participation if event is int the past? issue #168

    var alreadyParticipated = _.find(event.participants, function(part) {
      return part.user.equals(curUser._id);
    });

    if (act === 'remove' && alreadyParticipated) {
      event.participants = _.reject(event.participants, function(part) {
        return part.user.equals(curUser._id)});
      updateEvent('removed');
    } else if (act === 'add' && !alreadyParticipated) {
      event.participants.push({user: curUser._id, guests: params.guests});
      updateEvent('added');
    } else {
      res.json({status: 'added'});
    }
  });

};