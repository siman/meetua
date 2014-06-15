'use strict';

var appConfig = require('../../config/app-config.js');
var path = require('path');
var _ = require('underscore');
var store = require('../event/EventStore');
var logger = require('./logger')('notification-service.js');

var WindowsMailer = function() {
  return function() {
    logger.debug("Mock for sending email on Windows platform");
  };
};

var commonMailParams = {
  appConfig: appConfig
};

var LinuxMailer = function() {
  var templatesDir = path.resolve(__dirname, '../..',  'config','email-templates');
  var emailTemplates = require('email-templates');
  var mandrill = require('node-mandrill')(appConfig.notification.MANDRILL_KEY);

  /**
   * @param {String} email
   * @param {String} subject
   * @param {String} templateName
   * @param {Object} mailParams
   * @param {Function} cb
   */
  return function sendMailLinux(email, subject, templateName, mailParams, cb) {
    emailTemplates(templatesDir, function (err, template) {
      if (err) return cb(err);

      mailParams = _.extend({}, mailParams, commonMailParams);
      template(templateName, mailParams, function (err, html, text) {
        if (err) {
          logger.error('Failed to send email.', err);
          return cb(err);
        }

        var messageObj = {
          message: {
            to: [
              {email: email}
            ],
            from_email: appConfig.notification.MAIL_FROM,
            subject: subject,
            html: html
          }
        };
        logger.debug('message', JSON.stringify(messageObj));
        mandrill('/messages/send', messageObj, function (err, response) {
          if (err) {
            logger.error('Failed to send email.', err);
            return cb(err);
          }
          cb(null, response);
        });
      });
    });
  };
};

/**
 * @param {String} email
 * @param {String} subject
 * @param {String} templateName
 * @param {Object} mailParams
 * @param {Function} cb
 */
var sendMail = appConfig.IS_WINDOWS ? WindowsMailer() : LinuxMailer();

/**
 * @param {Object} user
 * @param {String} subject
 * @param {Object} event
 * @param {String} templateName
 * @param [cb]
 */
function notifyUser(user, subject, event, templateName, cb) {
  if (user.email && user.profile.receiveNotifications) {
    var params = { event: event };
    sendMail(user.email, subject, templateName, params, cb || function() {});
  } else cb()
}

module.exports.notifyAuthorOnCreate = function (event, cb) {
  logger.debug('Notify author on event creation', event.name);
  store.findById(event._id, ['author'], function (err, eventFound) {
   logger.debug('auth', eventFound.author);
   notifyUser(eventFound.author, 'Вы создали новое событие', eventFound, 'event-create', cb);

  })
};

module.exports.notifyParticipantOnEdit = function (event, cb) {
  logger.debug('Notify on event changing', event.name);
  store.findById(event._id, ['participants'], function (err, eventFound) {
      _.map(eventFound.participants, function (user) {
        notifyUser(user, 'Изменилось описание события', eventFound, 'event-edit', cb);
      })
    }
  )
};

module.exports.notifyParticipantOnJoin = function(user, event, cb) {
  logger.debug('Notify on taking part in event. New participant:', user.profile.name);
  notifyUser(user, 'Вы идете на событие', event, 'event-participate', cb);
};

function notifyComingSoonEvent(event) {
  logger.debug('Notify all participants about upcoming event');
  var subject = 'Ближайшее событие';
  notifyUser(event.author, subject, event, 'event-coming-soon');
  _.map(event.participants, function(user) {
    if (!user._id.equals(event.author._id))
      notifyUser(user, subject, event, 'event-coming-soon');
  });
}

module.exports.notifyUserPasswordReset = function(user, cb) {
  sendMail(user.email, 'Пароль изменён', 'user-password-reset', {user: user}, cb);
};

module.exports.notifyUserForgotPassword = function(user, token, cb) {
  sendMail(user.email, 'Восстановление пароля', 'user-forgot-password', {user: user, token: token}, cb);
};

module.exports.notifyOnCancel = function (event, cb) {
  logger.debug('Notify on event cancel', event.name);
  store.findCanceledById(event._id, ['participants', 'author'], function (err, eventFound) {
      logger.debug('eventFound:', eventFound);
      notifyUser(eventFound.author, 'Ближайшее событие', eventFound, 'event-cancel');
      _.map(eventFound.participants, function (user) {
        notifyUser(user, 'Ближайшее событие', eventFound, 'event-cancel', cb);
      })
    }
  )
};

module.exports.startCronJobs = function() {
  logger.debug("Starting notification cron jobs...");

  var CronJob = require('cron').CronJob;
  var eventStore = require('../event/EventStore');

  // Remind users about upcoming events.
  // Runs every day at 10:00:00 AM.
  new CronJob('00 00 10 * * *', function() {
    eventStore.findComingSoon(function(err, events) {
      if (err) return logger.debug(err);
      _.map(events, notifyComingSoonEvent);
    });
  }, null, true, "Europe/Kiev");

};