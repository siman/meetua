'use strict';

var appConfig = require('../../../config/app-config.js');
var path = require('path');
var _ = require('underscore');
var store = require('../event/event-store');
var logger = require('./logger')(__filename);
var async = require('async');
var moment = require('moment');

var WindowsMailer = function() {

  /**
   * @param {Function} cb
   */
  return function(user, subject, templateName, mailParams, cb) {
    logger.debug("Mock for sending email on Windows platform");
    cb();
  };
};

var LinuxMailer = function() {
  var templatesDir = path.resolve(__dirname, '../../..',  'config','email-templates');
  logger.debug('email templates dir ', templatesDir);
  var emailTemplates = require('email-templates');
  var mandrill = require('node-mandrill')(appConfig.notification.MANDRILL_KEY);

  /**
   * @param {String} email
   * @param {String} subject
   * @param {String} templateName
   * @param {Object} mailParams
   * @param {Function} cb
   */
  return function sendMailLinux(user, subject, templateName, mailParams, cb) {
    function commonMailParams() {
      return {
        appConfig: appConfig,
        user: user
      }
    }

    emailTemplates(templatesDir, function (err, template) {
      if (err) return cb(err);

      mailParams = _.extend({}, mailParams, commonMailParams());
      template(templateName, mailParams, function (err, html, text) {
        if (err) {
          logger.error('Failed to send email.', err);
          return cb(err);
        }

        var messageObj = {
          message: {
            to: [{email: user.emailNotifications.email}],
            from_email: appConfig.notification.MAIL_FROM,
            from_name: appConfig.notification.MAIL_FROM_NAME,
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
  logger.debug('notify user', user._id);
  cb = cb || function() {};
  logger.debug('user.receivingEmails', user.receivingEmails);
  logger.debug('user.emailNotifications.email', user.emailNotifications.email);
  if (user.receivingEmails) {
    var params = { event: event };
    sendMail(user, subject, templateName, params, cb);
  } else {
    logger.debug('Skipping sendMail to the user');
    cb();
  }
}

module.exports.notifyAuthorOnCreate = function (event, cb) {
  logger.debug('Notify author on event creation', event.name);
  store.findById(event._id, ['author'], function (err, eventFound) {
    if (err) return cb(err);
    if (!eventFound) return cb(new Error('Событие не найдено'));
   logger.debug('auth', eventFound.author);
   notifyUser(eventFound.author, 'Вы создали новое событие', eventFound, 'event-create', cb);
  });
};

module.exports.notifyParticipantOnEdit = function (event, cb) {
  logger.debug('Notify on event changing', event.name);
  store.findById(event._id, ['participants.user'], function (err, eventFound) {
    if (err) return cb(err);
    if (!eventFound) return cb(new Error('Событие не найдено'));
    if (eventFound.isBlocked) return cb();
    async.map(eventFound.participants, function (participant, done) {
      notifyUser(participant.user, 'Изменилось описание события', eventFound, 'event-edit', done);
    }, cb);
  });
};

module.exports.notifyParticipantOnJoin = function(user, event, cb) {
  logger.debug('Notify on taking part in event. New participant:', user.profile.name);
  notifyUser(user, 'Вы идете на событие', event, 'event-participate', cb);
};

module.exports.notifyComingSoonEvent = notifyComingSoonEvent;

function notifyComingSoonEvent(event) {
  logger.debug('Notify all participants about upcoming event', event._id);
  var subject = 'Ближайшее событие';
  store.findById(event._id, ['author', 'participants.user'], function (err, eventFound) {
    if (err) {
      logger.warn('Failed to notify about upcoming event.', err);
      return;
    }

    if (!eventFound) {
      logger.warn('Failed to notify about upcoming event. Event is not found.');
      return;
    }

    var templateName = eventFound.isBlocked ? 'event-blocked' : 'event-coming-soon';

    notifyUser(eventFound.author, subject, eventFound, templateName);
    _.map(eventFound.participants, function(participant) {
      if (!participant.user._id.equals(eventFound.author._id))
        notifyUser(user, subject, eventFound, 'event-coming-soon');
    });
  });
}

module.exports.notifyUserPasswordReset = function(user, cb) {
  sendMail(user, 'Пароль изменён', 'user-password-reset', {user: user}, cb);
};

module.exports.notifyUserForgotPassword = function(user, token, cb) {
  sendMail(user, 'Восстановление пароля', 'user-forgot-password', {user: user, token: token}, cb);
};

module.exports.notifyOnCancel = function (event, cb) {
  logger.debug('Notify on event cancel', event.name);
  store.findCanceledById(event._id, ['participants.user', 'author'], function (err, eventFound) { // TODO err handling
    logger.debug('eventFound:', eventFound);
    notifyUser(eventFound.author, 'Событие отменено', eventFound, 'event-cancel', function(err, result) {
      if (err) {
        logger.warn('Failed to send notification to user', eventFound.author._id, ' cause: ', err)
      }
    });
    async.map(eventFound.participants, function (participant, done) {
      notifyUser(participant.user, 'Ближайшее событие', eventFound, 'event-cancel', done);
    }, cb);
  });
};

module.exports.startCronJobs = function() {
  logger.debug("Starting notification cron jobs...");

  var CronJob = require('cron').CronJob;
  var eventStore = require('../event/event-store');

  // Remind users about upcoming events.
  // Runs every day at 10:00:00 AM.
  new CronJob('00 00 10 * * *', function() {
    eventStore.findComingSoon(function(err, events) {
      if (err) return logger.debug(err);
      _.map(events, notifyComingSoonEvent);
    });
  }, null, true, "Europe/Kiev");

};

module.exports.notifySupport = function (msg, cb) {
  logger.debug('Notifying support ' + appConfig.notification.MAIL_SUPPORT);
  var date = moment().format('LL');
  sendMail({email: appConfig.notification.MAIL_SUPPORT}, 'server error ' + date, 'server-error', {stack: msg}, cb);
};