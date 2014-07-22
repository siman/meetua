var path = require('path');
var PORT = 3001;
var DOMAIN = 'meetua.com';

module.exports = {
  secrets: {
    db: 'mongodb://localhost:27017/meetua-staging'
  },
  port: PORT,
  domain: DOMAIN,
  hostname: 'http://' + DOMAIN + ':' + PORT,
  LOG_FILE_NAME: 'staging-service.log',
  PERSISTENT_DATA_DIR: process.env.PERSISTENT_DATA_DIR || path.join(process.cwd(), '../PERSISTENT_DATA_DIR_STAGING')
};