'use strict';
var conf = require('../../config/app-config.js');
var path = require('path');
var templatesDir = path.resolve(__dirname, '../..',  'config','email-templates');
var emailTemplates = require('email-templates');

var mandrill = require('node-mandrill')(conf.notification.MANDRILL_KEY);

module.exports.notifyParticipant = function (user, event) {

	if (user.email) {

		emailTemplates(templatesDir, function (err, template) {
			if (err) {
				console.log(err);
			} else {
				var params = { eventName: event.name };
				template('event-participate', params, function (err, html, text) {

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

};
