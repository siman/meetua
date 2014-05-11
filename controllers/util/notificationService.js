'use strict';
var conf = require('../../config/app-config.js');
var path = require('path');
var templatesDir = path.resolve(__dirname, '../..',  'config','email-templates');
var emailTemplates = require('email-templates');
var _ = require('underscore');
var mandrill = require('node-mandrill')(conf.notification.MANDRILL_KEY);

function sendMail(event, user, templateName, mailParamas) {
  emailTemplates(templatesDir, function (err, template) {
    if (err) {
      console.log(err);
    } else {
      template(templateName, mailParamas, function (err, html, text) {

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
}

module.exports.notifyParticipantOnJoin = function (user, event) {
  console.log('notifying for participation... ', user.profile.name);
  if (user.email && user.profile.receiveNotifications) {
    var params = { eventName: event.name };
    sendMail(event, user, 'event-participate', params);
  }

};

module.exports.notifyCommingSoonEvents = function (event) {
  console.log('notfy coming sonn... ');

  _.map(event.participants, function(user) {
    console.log('user: ', user);
    if (user.email && user.profile.receiveNotifications) {
      var params = { eventName: event.name };
      sendMail(event, user, 'event-coming-soon', params);
    }
  });

};

