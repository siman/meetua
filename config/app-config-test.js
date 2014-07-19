var os = require('os');
var path = require('path');

module.exports = {
  secrets: {
    db: 'mongodb://localhost:27017/meetua-test'
  },
  UPLOAD_DIR: os.tmpDir(),
  EVENT_IMG_DIR: path.join(os.tmpDir(), 'event-imgs'),
  PERSISTENT_DATA_DIR: path.join(os.tmpDir(), 'PERSISTENT_DATA_DIR'),
  enableCsrf: false
};