var DOMAIN = 'meetua.com';

module.exports = {
  secrets: {
    db: 'mongodb://localhost:27017/meetua-prod'
  },
  port: 80,
  domain: DOMAIN,
  hostname: 'http://' + DOMAIN
};