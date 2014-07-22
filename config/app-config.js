'use strict';

var path = require('path');
var os = require('os');
var _ = require('lodash');
var moment = require('moment');
moment.lang('ru');

var DOMAIN = 'localhost';
var PORT = 3000;

// patch mongoose bulk methods
var mongoose = require('mongoose');
var realModel = mongoose.model.bind(mongoose);
mongoose.model = function(name, schema) {
  var model = realModel(name, schema);
  var unsupported = function() { throw new Error("Sorry Dave, I can't do that"); };
  model.remove = unsupported;
  model.findAndRemove = unsupported;
  model.update = unsupported;
  model.findByIdAndUpdate = unsupported;
  model.findOneAndUpdate = unsupported;
  model.findOneAndRemove = unsupported;
  model.findByIdAndRemove = unsupported;
  return model;
};


var config = {

  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_TEST: process.env.NODE_ENV === 'test',
  IS_STAGING: process.env.NODE_ENV === 'staging',
  // http://nodejs.org/api/process.html#process_process_platform
  IS_WINDOWS: process.platform === 'win32',
  IS_LINUX: process.platform === 'linux',

  // Uncomment to limit number of shown events on My events overview page.
//  MAX_EVENTS_IN_OVERVIEW: 5,

  PERSISTENT_DATA_DIR: process.env.PERSISTENT_DATA_DIR || path.join(process.cwd(), '../PERSISTENT_DATA_DIR'),
  EVENT_IMG_DIR: './public/upload',
  UPLOAD_DIR: path.join(os.tmpdir(), 'meetua', 'upload'),
  LOG_DIR_NAME: 'logs',
  LOG_FILE_NAME: 'service.log',

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
var envConfigName = './app-config-' + (process.env.NODE_ENV || 'development');
console.log('loading env-specific config: ' + envConfigName); // cannot use logger because of cycle dependency
var envSpecificConfigOverrides = require(envConfigName);
var finalConfig = _.merge({}, config, envSpecificConfigOverrides);
module.exports = finalConfig;