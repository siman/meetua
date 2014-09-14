'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var logger = require('../controllers/util/logger')(__filename);
var utils = require('../controllers/util/utils');
var appConfig = require('../../config/app-config');

var userSchema = new Schema({
  isGenerated: { type: Boolean, default: false },

  email: { type: String, unique: true, lowercase: true, sparse: true },
  password: String,

  facebook: String,
  vkontakte: String,
  tokens: Array,

  profile: {
    name: { type: String, default: '' },
    gender: { type: String, default: '' },
    location: { type: String, default: '' },
    website: { type: String, default: '' },
    picture: { type: String, default: '' },

    links: {
      facebook: { type: String, default: '' },
      vkontakte: { type: String, default: '' }
    },
    preferredActivities: [String], // activity names
    friends: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }]
  },

  // User could have other preferred ways of notifications: phone, twitter, fb, etc.
  emailNotifications: {
    enabled: { type: Boolean, default: true },
    email: { type: String, lowercase: true, default: '' }
  },

  /**
   * Settings to define whether user had some particular experience with UI or not.
   */
//  ux: {
//    // Nothing yet
//  },

  resetPasswordToken: String,
  unsubscribeToken: String,
  resetPasswordExpires: Date
});

/**
 * Hash the password for security.
 * "Pre" is a Mongoose middleware that executes before each user.save() call.
 */

userSchema.pre('save', true, function hashPassword(next, done) {
  next();
  logger.debug('hash password for user ' + this.email);
  var user = this;

  if (!user.isModified('password')) return done();

  bcrypt.genSalt(5, function(err, salt) {
    if (err) return done(err);

    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) return done(err);
      user.password = hash;
      done();
    });
  });
});

userSchema.pre('save', true, function generateUnsubscribeToken(next, done) {
  next();
  logger.debug('generate unsubscribe token for user ' + this.email);
  var user = this;

  if (user.unsubscribeToken) return done();

  utils.generateToken(function(err, token) {
    if (err) return done(err);
    user.unsubscribeToken = token;
    done();
  });
});

/**
 * Validate user's password.
 * Used by Passport-Local Strategy for password validation.
 */

userSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

userSchema.virtual('url').get(function() {
  return appConfig.hostname + '/user/' + this._id;
});

userSchema.virtual('profile.ru.gender').get(function() {
  var gender = this.profile.gender;
  if (gender === 'male') {
    return 'мужской';
  } else if (gender === 'female') {
    return 'женский';
  } else {
    return gender;
  }
});

userSchema.virtual('receivingEmails').get(function() {
  return this.emailNotifications.enabled && this.emailNotifications.email;
});

userSchema.set('toJSON', {virtuals: true });

module.exports = mongoose.model('User', userSchema);


