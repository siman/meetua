var path = require('path');
var os = require('os');

module.exports = {
    EVENT_IMG_DIR: './public/img/events',
    UPLOAD_DIR: path.join(os.tmpdir(), 'upload')
};