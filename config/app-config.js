'use strict';

var path = require('path');
var os = require('os');
var _ = require('lodash');
var moment = require('moment');
moment.lang('ru');

require('./patch-mongoose');
require('./patch-error');

var DOMAIN = 'localhost';
var PORT = 3000;

var NODE_ENV = process.env.NODE_ENV || 'development';

var config = {

  ENV: NODE_ENV,

  // http://nodejs.org/api/process.html#process_process_platform
  IS_WINDOWS: process.platform === 'win32',
  IS_LINUX: process.platform === 'linux',

  IS_PRODUCTION: NODE_ENV === 'production',
  IS_DEVELOPMENT: NODE_ENV === 'development',
  IS_TEST: NODE_ENV === 'test',
  IS_STAGING: NODE_ENV === 'staging',

  PERSISTENT_DATA_DIR: process.env.PERSISTENT_DATA_DIR || path.join(process.cwd(), '../PERSISTENT_DATA_DIR'),
  EVENT_IMG_DIR: path.join(process.cwd(), 'public/upload'),
  UPLOAD_DIR: path.join(os.tmpdir(), 'meetua', 'upload'),
  LOG_DIR_NAME: 'logs',
  LOG_FILE_NAME: 'service.log',

  eventThumbnail: {
    width: 400,
    height: 400
  },

  notification: {
    MANDRILL_KEY: 'iiiPHm_fhC7JrK4vgExm0A',
    MAIL_FROM: 'noreply@meetua.com',
    MAIL_FROM_NAME: 'MeetUA',
    MAIL_SUPPORT: 'meetua.supp@gmail.com'
  },

  domain: DOMAIN,
  port: PORT,
  hostname: 'http://' + DOMAIN + ':' + PORT,

  socialTweetLinkLength: 22,

  enableCsrf: true,

  buildAssets: false,

  secrets: secrets()
};

function secrets() {
  return {
    db: process.env.MONGODB || 'mongodb://localhost:27017/test',

    sessionSecret: process.env.SESSION_SECRET || 'Your Session Secret goes here',

    localAuth: true,

    facebookAuth: true,
    facebook: {
      clientID: process.env.FACEBOOK_ID || '231654163709403',
      clientSecret: process.env.FACEBOOK_SECRET || '5de9fd512eb5470c8a305d6ce294ec5b',
      callbackURL: '/auth/facebook/callback',
      passReqToCallback: true
    },

    vkAuth: true,
    vk: {
      clientID: process.env.VK_ID || '4342834',
      clientSecret: process.env.VK_SECRET || 'v4Y1BbQ9BF2s2MVhzY4H',
  //    clientID: process.env.VK_ID || '4342941',
  //    clientSecret: process.env.VK_SECRET || 'HtX1C4eEuDjIQMiXUONF',
      callbackURL: '/auth/vkontakte/callback',
      passReqToCallback: true
    }
  };
}

// env-specific config overrides
var envConfigName = './app-config-' + config.ENV;
console.log('Loading env-specific config: ' + envConfigName); // cannot use logger because of cycle dependency
var envSpecificConfigOverrides = require(envConfigName);
var finalConfig = _.merge({}, config, envSpecificConfigOverrides);
module.exports = finalConfig;