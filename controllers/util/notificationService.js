'use strict';

var conf = require('../../config/app-config.js');
var path = require('path');
var _ = require('underscore');
var store = require('../event/EventStore');

var WindowsMailer = function() {
  return function(event, user, templateName, mailParams) {
    console.log("Mock for sending email on Windows platform");
  };
};

var LinuxMailer = function() {
  var templatesDir = path.resolve(__dirname, '../..',  'config','email-templates');
  var emailTemplates = require('email-templates');
  var mandrill = require('node-mandrill')(conf.notification.MANDRILL_KEY);

  return function(event, user, templateName, mailParams) {
    emailTemplates(templatesDir, function (err, template) {
      if (err) {
        console.log(err);
      } else {
        template(templateName, mailParams, function (err, html, text) {
          mandrill('/messages/send', {
            message: {
              to: [
                {email: user.email}
              ],
              from_email: conf.notification.MAIL_FROM,
              subject: 'meetua subject',
              html: html
            }
          }, function (error, response) {
            if (error) console.log(JSON.stringify(error));
            else console.log(response);
          });
        });
      }
    });
  };
};

var sendMail = conf.IS_WINDOWS ? WindowsMailer() : LinuxMailer();

function notifyUser(user, event, templateName) {
  if (user.email && user.profile.receiveNotifications) {
    var params = { eventName: event.name };
    sendMail(event, user, templateName, params);
  }
}

module.exports.notifyParticipantOnEdit = function (event) {
  console.log('Notify on event changing', event.name);
  var populatedEvent = store.findById(event._id, ['participants'], function (err, eventFound) {
      _.map(eventFound.participants, function (user) {
        console.log('userrrrrrrrr', user);
        notifyUser(user, eventFound, 'event-edit');
      })
    }
  )
};

module.exports.notifyParticipantOnJoin = function(user, event) {
  console.log('Notify on taking part in event. New participant:', user.profile.name);
  notifyUser(user, event, 'event-participate');
};

function notifyComingSoonEvent(event) {
  console.log('Notify all participants about upcoming event');
  notifyUser(event.author, event, 'event-coming-soon');
  _.map(event.participants, function(user) {
    //Can I make this shorter?
    if (JSON.stringify(user._id) != JSON.stringify(event.author._id))
      notifyUser(user, event, 'event-coming-soon');
  });
}

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