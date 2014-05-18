'use strict';

var path = require('path');
var os = require('os');
var moment = require('moment');
moment.lang('ru');

var DOMAIN = 'meetua.com';

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


module.exports = {

  // http://nodejs.org/api/process.html#process_process_platform
  IS_WINDOWS: process.platform === 'win32',
  IS_LINUX: process.platform === 'linux',

  // Uncomment to limit number of shown events on My events overview page.
//  MAX_EVENTS_IN_OVERVIEW: 5,

  EVENT_IMG_DIR: './public/upload',
  UPLOAD_DIR: path.join(os.tmpdir(), 'meetua', 'upload'),

  notification: {
    MANDRILL_KEY: 'iiiPHm_fhC7JrK4vgExm0A',
    MAIL_FROM: 'no-reply@' + DOMAIN
  },
  domain: DOMAIN,
  hostname: 'http://' + DOMAIN,

  socialTweetLinkLength: 22

};