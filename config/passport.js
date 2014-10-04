'use strict';

var logger = require('../app/controllers/util/logger')(__filename);
var _ = require('underscore');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var VKontakteStrategy = require('passport-vkontakte').Strategy;
var User = require('../app/models/User');
var secrets = require('./app-config').secrets;

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(deserializeUser);

function deserializeUser(id, done) {
  User.findById(id).populate('profile.friends').exec(function(err, user) {
    var logMsg = 'Auth callback. '; // for URL [' + req.url + ']. ';
    if (!user) {
      // Not logged-in.
      logger.debug(logMsg + 'User not found by ID [' + id + ']');
    } else {
      // Logged in.
      logger.debug(logMsg + 'Deserialized user [' + user.email + ']');
    }
    done(err, user)
  });
}

/**
 * OAuth Strategy Overview
 *
 * - User is already logged in.
 *   - Check if there is an existing account with a provider id or email.
 *     - If there is, return an error message. (Account merging not supported)
 *     - Else link new OAuth account with currently logged-in user.
 * - User is not logged in.
 *   - Check if it's a returning user.
 *     - If returning user, sign in and we are done.
 *     - Else check if there is an existing account with user's email.
 *       - If there is, return an error message.
 *       - Else create a new account.
 */

/**
 * Sign in using Email and Password.
 */
var localAuthImpl = new LocalStrategy({ usernameField: 'email' }, function(email, password, done) {
  User.findOne({ email: email }, function(err, user) {
    if (!user) return done(null, false, { message: 'Email ' + email + ' not found'});
    user.comparePassword(password, function(err, isMatch) {
      if (isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Invalid email or password.' });
      }
    });
  });
});

/**
 * Sign in with Facebook.
 */
var fbAuthImpl = new FacebookStrategy(secrets.facebook, function(req, accessToken, refreshToken, profile, done) {
  if (req.user) {
    var query = profile.email ? { $or: [{ facebook: profile.id }, { email: profile.email }] } : { facebook: profile.id };
    User.findOne(query, function(err, existingUser) {
      if (existingUser) {
        done('У вас уже есть Facebook аккаунт. Войдите через Facebook и удалите его, затем повторите попытку привязать аккаунт.');
      } else {
        deserializeUser(req.user.id, function(err, user) {
          user.facebook = profile.id;
          user.tokens.push({ kind: 'facebook', accessToken: accessToken });
          user.profile.name = user.profile.name || profile.displayName;
          user.profile.gender = user.profile.gender || profile._json.gender;
          user.profile.links.facebook = user.profile.links.facebook || profile._json.link;
          user.profile.picture = user.profile.picture || 'https://graph.facebook.com/' + profile.id + '/picture?type=large';
          suggestEmailForNotifications(user, user.email, profile.email);
          user.save(function(err) {
            req.flash('info', { msg: 'Facebook аккаунт успешно привязан.' });
            done(err, user);
          });
        });
      }
    });
  } else {
    User.findOne({ facebook: profile._json.id }, function(err, existingUser) {
      if (existingUser) return done(null, existingUser);
      User.findOne({ email: profile._json.email }, function(err, existingEmailUser) {
        if (existingEmailUser) {
          req.flash('errors', { msg: 'Аккаунт с таким email уже существует. Зайдите через этот аккаунт и нажмите "Привязать аккаунт" на странице аккаунта.' });
          done(err);
        } else {
          var user = new User();
          user.email = profile._json.email;
          user.facebook = profile._json.id;
          user.tokens.push({ kind: 'facebook', accessToken: accessToken });
          user.profile.name = profile.displayName;
          user.profile.gender = profile._json.gender;
          user.profile.links.facebook = profile._json.link;
          user.profile.picture = 'https://graph.facebook.com/' + profile._json.id + '/picture?type=large';
          user.profile.location = (profile._json.location) ? profile._json.location.name : '';
          suggestEmailForNotifications(user, profile._json.email, '');
          user.save(function(err) {
            done(err, user);
          });
        }
      });
    });
  }
});

/**
 * Sign in with VKontakte
 */
var vkAuthImpl = new VKontakteStrategy(secrets.vk,
  function(req, accessToken, refreshToken, profile, done) {
    if (req.user) {
      User.findOne({ vkontakte: profile.id }, function(err, existingUser) {
        if (existingUser) {
          req.flash('errors', { msg: 'У вас уже есть VKontakte аккаунт. Войдите через VKontakte и удалите его, затем повторите попытку привязать аккаунт.' });
          done(err);
        } else {
          User.findById(req.user.id, function(err, user) {
            user.vkontakte = profile.id;
            user.tokens.push({ kind: 'vkontakte', accessToken: accessToken });
            user.profile.name = user.profile.name || profile.displayName;
            user.profile.gender = user.profile.gender || profile.gender;
            user.profile.links.vkontakte = user.profile.links.vkontakte || profile.profileUrl;
            user.profile.picture = user.profile.picture || profile._json.photo;
            user.save(function(err) {
              req.flash('info', { msg: 'Vkontakte аккаунт успешно отвязан.' });
              done(err, user);
            });
          });
        }
      });
    } else {
      User.findOne({ vkontakte: profile.id }, function(err, existingUser) {
        if (existingUser) return done(null, existingUser);
        var user = new User();
        user.vkontakte = profile.id;
        user.tokens.push({ kind: 'vkontakte', accessToken: accessToken});
        user.profile.name = user.profile.name || profile.displayName;
        user.profile.gender = user.profile.gender || profile.gender;
        user.profile.links.vkontakte = profile.profileUrl;
        user.profile.picture = user.profile.picture || profile._json.photo;
        user.save(function(err) {
          done(err, user);
        });
      });
    }
  }
);

function suggestEmailForNotifications(user, email1, email2) {
  if (!user.emailNotifications.email) {
    user.emailNotifications.email = email1 || email2;
  }
}

passport.use(localAuthImpl);
passport.use(fbAuthImpl);
passport.use(vkAuthImpl);

/**
 * Login Required middleware.
 */
exports.isAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.send(401);
};

/**
 * Authorization Required middleware.
 */
exports.isAuthorized = function(req, res, next) {
  var provider = req.path.split('/').slice(-1)[0];
  if (_.findWhere(req.user.tokens, { kind: provider })) next();
  else res.redirect('/auth/' + provider);
};
