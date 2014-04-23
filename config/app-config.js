var path = require('path');
var os = require('os');

module.exports = {
    EVENT_IMG_DIR: './public/upload',
    UPLOAD_DIR: path.join(os.tmpdir(), 'upload')
};