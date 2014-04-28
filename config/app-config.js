'use strict';

var path = require('path');
var os = require('os');
var moment = require('moment');
moment.lang('ru');

module.exports = {
    EVENT_IMG_DIR: './public/upload',
    UPLOAD_DIR: path.join(os.tmpdir(), 'upload')
};