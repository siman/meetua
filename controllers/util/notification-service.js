'use strict';

var appConfig = require('../../config/app-config.js');
var path = require('path');
var _ = require('underscore');
var store = require('../event/EventStore');

var WindowsMailer = function() {
  return function() {
    console.log("Mock for sending email on Windows platform");
  };
};

var commonMailParams = {
  appConfig: appConfig
};

var LinuxMailer = function() {
  var templatesDir = path.resolve(__dirname, '../..',  'config','email-templates');
  var emailTemplates = require('email-templates');
  var mandrill = require('node-mandrill')(appConfig.notification.MANDRILL_KEY);

  return function sendMailLinux(user, subject, templateName, mailParams, cb) {
    emailTemplates(templatesDir, function (err, template) {
      if (err) return cb(err);

      mailParams = _.extend({}, mailParams, commonMailParams);
      template(templateName, mailParams, function (err, html, text) {
        if (err) return cb(err);

        var messageObj = {
          message: {
            to: [
              {email: user.email}
            ],
            from_email: appConfig.notification.MAIL_FROM,
            subject: subject,
            html: html
          }
        };
        console.log('message', JSON.stringify(messageObj));
        mandrill('/messages/send', messageObj, function (err, response) {
          if (err) return cb(err);
          cb(null, response);
        });
      });
    });
  };
};

var sendMail = appConfig.IS_WINDOWS ? WindowsMailer() : LinuxMailer();

/**
 * @param user
 * @param subject
 * @param event
 * @param templateName
 * @param [cb]
 */
function notifyUser(user, subject, event, templateName, cb) {
  if (user.email && user.profile.receiveNotifications) {
    var params = { eventName: event.name };
    sendMail(user, subject, templateName, params, cb || function() {});
  }
}

module.exports.notifyAuthorOnCreate = function (event, cb) {
  console.log('Notify author on event creation', event.name);
  store.findById(event._id, ['author'], function (err, eventFound) {
   console.log('auth', eventFound.author);
   notifyUser(eventFound.author, 'Вы создали новое событие', eventFound, 'event-create', cb);

  })
};

module.exports.notifyParticipantOnEdit = function (event, cb) {
  console.log('Notify on event changing', event.name);
  store.findById(event._id, ['participants'], function (err, eventFound) {
      _.map(eventFound.participants, function (user) {
        notifyUser(user, 'Изменилось описание события', eventFound, 'event-edit', cb);
      })
    }
  )
};

module.exports.notifyParticipantOnJoin = function(user, event, cb) {
  console.log('Notify on taking part in event. New participant:', user.profile.name);
  notifyUser(user, 'Вы собираетесь принять участие', event, 'event-participate', cb);
};

function notifyComingSoonEvent(event) {
  console.log('Notify all participants about upcoming event');
  notifyUser(event.author, event, 'event-coming-soon');
  _.map(event.participants, function(user) {
    if (!user._id.equals(event.author._id))
      notifyUser(user, event, 'event-coming-soon');
  });
}

module.exports.notifyUserPasswordReset = function(user, cb) {
  sendMail(user, 'Пароль изменён', 'user-password-reset', {user: user}, cb);
};

module.exports.notifyUserForgotPassword = function(user, token, cb) {
  sendMail(user, 'Восстановление пароля', 'user-forgot-password', {user: user, token: token}, cb);
};

module.exports.notifyOnCancel = function (event, cb) {
  console.log('Notify on event cancel', event.name);
  store.findCanceledById(event._id, ['participants', 'author'], function (err, eventFound) {
      console.log('eventFound:', eventFound);
      notifyUser(eventFound.author, 'Ближайшее событие', eventFound, 'event-cancel');
      _.map(eventFound.participants, function (user) {
        notifyUser(user, 'Ближайшее событие', eventFound, 'event-cancel', cb);
      })
    }
  )
};

module.exports.startCronJobs = function() {
  console.log("Starting notification cron jobs...");

  var CronJob = require('cron').CronJob;
  var eventStore = require('../event/EventStore');

  // Remind users about upcoming events.
  // Runs every day at 10:00:00 AM.
  new CronJob('00 00 10 * * *', function() {
    eventStore.findComingSoon(function(err, events) {
      if (err) return console.log(err);
      _.map(events, notifyComingSoonEvent);
    });
  }, null, true, "Europe/Kiev");

};