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

  enableCsrf: process.env.NODE_ENV != 'test',

  secrets: secrets()
};


function secrets() {
  return {
    db: process.env.MONGODB || 'mongodb://localhost:27017/test',

    sessionSecret: process.env.SESSION_SECRET || 'Your Session Secret goes here',

    localAuth: true,

    mailgun: {
      login: process.env.MAILGUN_LOGIN || 'Your Mailgun SMTP Username',
      password: process.env.MAILGUN_PASSWORD || 'Your Mailgun SMTP Password'
    },

    sendgrid: {
      user: process.env.SENDGRID_USER || 'Your SendGrid Username',
      password: process.env.SENDGRID_PASSWORD || 'Your SendGrid Password'
    },

    nyt: {
      key: process.env.NYT_KEY || 'Your New York Times API Key'
    },

    lastfm: {
      api_key: process.env.LASTFM_KEY || 'Your API Key',
      secret: process.env.LASTFM_SECRET || 'Your API Secret'
    },

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
    },


    githubAuth: false,
    github: {
      clientID: process.env.GITHUB_ID || 'Your Client ID',
      clientSecret: process.env.GITHUB_SECRET || 'Your Client Secret',
      callbackURL: '/auth/github/callback',
      passReqToCallback: true
    },

    twitterAuth: false,
    twitter: {
      consumerKey: process.env.TWITTER_KEY || 'Your Consumer Key',
      consumerSecret: process.env.TWITTER_SECRET  || 'Your Consumer Secret',
      callbackURL: '/auth/twitter/callback',
      passReqToCallback: true
    },

    googleAuth: false,
    google: {
      clientID: process.env.GOOGLE_ID || 'Your Client ID',
      clientSecret: process.env.GOOGLE_SECRET || 'Your Client Secret',
      callbackURL: '/auth/google/callback',
      passReqToCallback: true
    },

    linkedinAuth: false,
    linkedin: {
      clientID: process.env.LINKEDIN_ID || 'Your Client ID',
      clientSecret: process.env.LINKEDIN_SECRET || 'Your Client Secret',
      callbackURL: '/auth/linkedin/callback',
      scope: ['r_fullprofile', 'r_emailaddress', 'r_network'],
      passReqToCallback: true
    },

    steam: {
      apiKey: process.env.STEAM_KEY || 'Your Steam API Key'
    },

    twilio: {
      sid: process.env.TWILIO_SID || 'Your Twilio SID',
      token: process.env.TWILIO_TOKEN || 'Your Twilio token'
    },

    clockwork: {
      apiKey: process.env.CLOCKWORK_KEY || 'Your Clockwork SMS API Key'
    },

    tumblr: {
      consumerKey: process.env.TUMBLR_KEY || 'Your Consumer Key',
      consumerSecret: process.env.TUMBLR_SECRET || 'Your Consumer Secret',
      callbackURL: '/auth/tumblr/callback'
    },

    foursquare: {
      clientId: process.env.FOURSQUARE_ID || 'Your Client ID',
      clientSecret: process.env.FOURSQUARE_SECRET || 'Your Client Secret',
      redirectUrl: process.env.FOURSQUARE_REDIRECT_URL || 'http://localhost:3000/auth/foursquare/callback'
    },

    venmo: {
      clientId: process.env.VENMO_ID || 'Your Venmo Client ID',
      clientSecret: process.env.VENMO_SECRET || 'Your Venmo Client Secret',
      redirectUrl: process.env.VENMO_REDIRECT_URL || 'http://localhost:3000/auth/venmo/callback'
    },

    paypal: {
      host: process.env.PAYPAL_HOST || 'api.sandbox.paypal.com',
      client_id: process.env.PAYPAL_ID || 'Your Client ID',
      client_secret: process.env.PAYPAL_SECRET || 'Your Client Secret',
      returnUrl: process.env.PAYPAL_RETURN_URL || 'http://localhost:3000/api/paypal/success',
      cancelUrl: process.env.PAYPAL_CANCEL_URL || 'http://localhost:3000/api/paypal/cancel'
    }
  };
}

// env-specific config overrides
var envConfigName = './app-config-' + (process.env.NODE_ENV || 'development');
console.log('loading env-specific config: ' + envConfigName); // cannot use logger because of cycle dependency
var envSpecificConfigOverrides = require(envConfigName);
var finalConfig = _.merge({}, config, envSpecificConfigOverrides);
module.exports = finalConfig;