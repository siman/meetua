'use strict';

var conf = require('../../config/app-config.js');
var path = require('path');
var _ = require('underscore');

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

module.exports.notifyParticipantOnJoin = function(user, event) {
  console.log('Notify on taking part in event. New participant', user.profile.name);
  if (user.email && user.profile.receiveNotifications) {
    var params = { eventName: event.name };
    sendMail(event, user, 'event-participate', params);
  }
};

module.exports.notifyComingSoonEvent = function(event) {
  console.log('Notify all participants about upcoming event');
  _.map(event.participants, function(user) {
    console.log('user: ', user);
    if (user.email && user.profile.receiveNotifications) {
      var params = { eventName: event.name };
      sendMail(event, user, 'event-coming-soon', params);
    }
  });
};

