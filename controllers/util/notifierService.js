'use strict';
var conf = require('../../config/app-config.js');
var mandrill = require('node-mandrill')(conf.notification.MANDRILL_KEY);

module.exports.notifyParticipant = function (user) {
	var mailto;

	if (user.email) {
		mailto = user.email;

		mandrill('/messages/send', {
			message: {
				to: [
					{email: mailto}
				],
				from_email: conf.notification.MAIL_FROM,
				subject: 'meetua subject',
				text: "meetua text"
			}
		}, function (error, response) {
			if (error) console.log(JSON.stringify(error));
			else console.log(response);
		});

	}
};
