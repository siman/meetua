'use strict';

var path = require('path');
var os = require('os');
var moment = require('moment');
moment.lang('ru');

module.exports = {
  MAX_EVENTS_IN_OVERVIEW: 5,
  EVENT_IMG_DIR: './public/upload',
  UPLOAD_DIR: path.join(os.tmpdir(), 'meetua', 'upload'),

	notification: {
		MANDRILL_KEY: 'iiiPHm_fhC7JrK4vgExm0A',
		MAIL_FROM: 'meetua@domain.conf'
	}

};