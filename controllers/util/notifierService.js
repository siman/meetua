'use strict';
var mandrill = require('node-mandrill')('iiiPHm_fhC7JrK4vgExm0A');

module.exports.notifyParticipant = function (user) {
	var mailto;

	if (user.email) {
		mailto = user.email;

		mandrill('/messages/send', {
			message: {
				to: [
					{email: mailto}
				],
				from_email: 'meetua@domain.com',
				subject: 'meetua subject',
				text: "meetua text"
			}
		}, function (error, response) {
			if (error) console.log(JSON.stringify(error));
			else console.log(response);
		});

	}
};
