var PORT = 3001;
var DOMAIN = 'meetua.com';

module.exports = {
  secrets: {
    db: 'mongodb://localhost:27017/meetua-staging'
  },
  port: PORT,
  domain: DOMAIN,
  hostname: 'http://' + DOMAIN + ':' + PORT
};