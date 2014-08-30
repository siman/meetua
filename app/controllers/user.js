'use strict';

var _ = require('underscore');
var async = require('async');
var passport = require('passport');
var User = require('../models/User');
var secrets = require('../../config/app-config').secrets;
var utils = require('./utils');
var mockUsers = require('./user-mock-store');
var notificationService = require('./util/notification-service');
var logger = require('./util/logger')(__filename);

var api = {
  postLoginRest: function(req, res, next) {
    logger.debug('postLoginRest');
    req.assert('email', 'Неверный email').isEmail();
    req.assert('password', 'Пароль не указан').notEmpty();

    var errors = req.validationErrors(true);

    if (errors) {
      logger.debug('errors ' + JSON.stringify(errors));
      return res.json(400, errors);
    }

    passport.authenticate('local', function(err, user, info) {
      logger.debug('[authenticate res] err: ' + JSON.stringify(err) + ' user: ' + user);
      if (err) return next(err);
      if (!user) {
        var err = {'user': {param: 'user', msg: 'Неверный email или пароль'}};
        logger.warn('err ' + JSON.stringify(err));
        return res.json(400, err);
      }
      req.logIn(user, function(err) {
        if (err) return next(err);
        res.json(200, { user: user });
      });
    })(req, res, next);
  },

  getLogin: function(req, res, next) {
    res.send(200); // successfully logged in with auth-modal, you can return here any data you need for logged in user
  },

  getCurrentUser: function(req, res, next) {
    return res.json({user: req.user});
  },

  postSetupUserNotifications: function(req, res, next) {
    var user = req.user;
    var params = req.body;
    logger.debug('Setup user notifications', params);

    var enabled = params.enabled === true;
    user.emailNotifications.enabled = enabled;
    if (enabled) {
      user.emailNotifications.email = params.email;
    }
    user.save(function(err) {
      if (err) {
        return res.json(500, 'Не удалось обновить Ваш профиль');
      }
      logger.debug('User updated', user);
      return res.send(200);
    });
  },

  postUpdateProfile: function(req, res, next) {
    var errMsg = 'Не удалось обновить Ваш профиль';
    req.assert('email', 'Неверный email').isEmail();
    req.assert('profile.name', 'Не указано имя').notEmpty();
    req.body.website && req.assert('website', 'Ссылка должна быть формата http://<адрес_сайта>').isURL();
    var reqUser = req.body;
    logger.debug('reqUser', reqUser);

    var errors = req.validationErrors();
    if (errors) {
      logger.debug('errors ' + JSON.stringify(errors));
      return res.json(400, errors);
    }

    User.findById(req.user.id, function(err, user) {
      if (err) return res.json(500, errMsg);
      user.email = reqUser.email;
      user.profile.name = reqUser.profile.name || '';
      user.profile.gender = reqUser.profile.gender || '';
      user.profile.location = reqUser.profile.location || '';
      user.profile.website = reqUser.profile.website || '';
      user.profile.preferredActivities = reqUser.profile.preferredActivities || [];

      // TODO: Replace with new notifications widget
      user.profile.receiveNotifications = reqUser.profile.receiveNotifications;

      user.save(function(err) {
        if (err) return res.json(500, errMsg);
        res.json(200);
      });
    });
  }
};

exports.api = api;

exports.getUserProfile = function(req, res, next) {
  res.render('profile/profile', {
    title: 'Пользователь ' + (req.userById.profile ? req.userById.profile.name : ''),
    userProfile: req.userById
  });
};

exports.userById = function(req, res, next, id) {
  User.findOne({_id: id}).exec(function(err, user) {
    if (err) return next(err);
    if (!user) return next(new Error('Пользователь не найден'));
    req.userById = user;
    next();
  });
};

/**
 * GET /logout
 * Log out.
 */

exports.logout = function(req, res) {
  req.logout();
  res.redirect('/');
};

/**
 * GET /signup
 * Signup page.
 */

exports.getSignup = function(req, res) {
  if (req.user) return res.redirect('/');
  res.render('account/signup', {
    title: 'Создать аккаунт'
  });
};

/**
 * POST /signup
 * Create a new local account.
 * @param email
 * @param password
 */

exports.postSignup = function(req, res, next) {
  req.assert('email', 'Неверный email').isEmail();
  req.assert('password', 'Пароль должен иметь длину минимум 4 символа').len(4);
  req.assert('confirmPassword', 'Пароли не совпадают').equals(req.body.password);

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/signup');
  }

  var user = new User({
    email: req.body.email,
    password: req.body.password
  });

  user.save(function(err) {
    if (err) {
      if (err.code === 11000) {
        req.flash('errors', { msg: 'Пользователь с таким email уже cуществует' });
      }
      return res.redirect('/signup');
    }
    req.logIn(user, function(err) {
      if (err) return next(err);
      res.redirect('/');
    });
  });
};

/**
 * GET /account
 * Profile page.
 */

exports.getAccount = function(req, res) {
  res.render('account/profile', {
    title: 'Личные данные'
  });
};

/**
 * POST /account/password
 * Update current password.
 * @param password
 */

exports.postUpdatePassword = function(req, res, next) {
  req.assert('password', 'Пароль должен иметь длину минимум 4 символа').len(4);
  req.assert('confirmPassword', 'Пароли не совпадают').equals(req.body.password);

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/account');
  }

  User.findById(req.user.id, function(err, user) {
    if (err) return next(err);

    user.password = req.body.password;

    user.save(function(err) {
      if (err) return next(err);
      req.flash('success', { msg: 'Пароль успешно изменён.' });
      res.redirect('/account');
    });
  });
};

/**
 * POST /account/delete
 * Delete user account.
 * @param id - User ObjectId
 */

exports.postDeleteAccount = function(req, res, next) {
  User.findById(req.user.id, function(err, user) {
    if (err) return next(err);
    if (!user) return next('Пользователь не найден');
    user.remove(function(err) {
      if (err) return next(err);
      req.logout();
      res.redirect('/');
    });
  })
};

/**
 * GET /account/unlink/:provider
 * Unlink OAuth2 provider from the current user.
 * @param provider
 * @param id - User ObjectId
 */

exports.getOauthUnlink = function(req, res, next) {
  var provider = req.params.provider;
  User.findById(req.user.id, function(err, user) {
    if (err) return next(err);

    user[provider] = undefined;
    user.tokens = _.reject(user.tokens, function(token) { return token.kind === provider; });

    user.save(function(err) {
      if (err) return next(err);
      req.flash('info', { msg: provider + ' аккаунт успешно отвязан.' });
      res.redirect('/account');
    });
  });
};

/**
 * GET /reset/:token
 * Reset Password page.
 */

exports.getReset = function(req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }

  var resetPasswordToken = req.params.token;
  User
    .findOne({ resetPasswordToken: resetPasswordToken })
    .where('resetPasswordExpires').gt(Date.now())
    .exec(function(err, user) {
      if (!user) {
        req.flash('errors', { msg: 'Ссылка, по которой вы перешли, неверная или устарела.' });
        return res.redirect('/forgot');
      }
      res.render('account/reset', {
        title: 'Изменение пароля',
        token: resetPasswordToken
      });
    });
};

/**
 * POST /reset/:token
 * Process the reset password request.
 */

exports.postReset = function(req, res, next) {
  req.assert('password', 'Пароль должен иметь длину минимум 4 символа.').len(4);
  req.assert('confirm', 'Пароли должны совпадать.').equals(req.body.password);

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('back');
  }

  async.waterfall([
    function(done) {
      User
        .findOne({ resetPasswordToken: req.params.token })
        .where('resetPasswordExpires').gt(Date.now())
        .exec(function(err, user) {
          if (!user) {
            req.flash('errors', { msg: 'Ссылка, по которой вы перешли, неверная или устарела.' });
            return res.redirect('back');
          }

          user.password = req.body.password;
          user.resetPasswordToken = undefined;
          user.resetPasswordExpires = undefined;

          user.save(function(err) {
            if (err) return next(err);
            req.logIn(user, function(err) {
              done(err, user);
            });
          });
        });
    },
    function(user, done) {
      notificationService.notifyUserPasswordReset(user, function(err) {
        req.flash('success', { msg: 'Ваш пароль был успешно изменён.' });
        done(err);
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/');
  });
};

/**
 * GET /forgot
 * Forgot Password page.
 */

exports.getForgot = function(req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.render('account/forgot', {
    title: 'Восстановление пароля'
  });
};

/**
 * POST /forgot
 * Create a random token, then the send user an email with a reset link.
 * @param email
 */

exports.postForgot = function(req, res, next) {
  req.assert('email', 'Неверный email.').isEmail();

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/forgot');
  }

  async.waterfall([
    utils.generateToken,
    function(token, done) {
      User.findOne({ email: req.body.email.toLowerCase() }, function(err, user) {
        if (!user) {
          req.flash('errors', { msg: 'Пользователь с таким email не найден.' });
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      notificationService.notifyUserForgotPassword(user, token, function(err) {
        req.flash('info', { msg: 'Письмо с инструкциями по восстановлению пароля было выслано на ' + user.email + '.' });
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
};

exports.getUnsubscribe = function(req, res, next) {
  async.waterfall([
    function(done) {
      req.assert('token', 'Ссылка неверная или устарела').notEmpty();
      req.assert('email', 'Ссылка неверная или устарела').notEmpty();
      done(req.validationErrors());
    },
    function(done) {
      User.findOne({ email: req.params.email.toLowerCase(), unsubscribeToken: req.params.token }, function(err, user) {
        if (!user) return done({ msg: 'Ссылка неверная или устарела' });

        logger.debug('unsubscribe user', user.email);

        user.unsubscribeToken = undefined;
        user.receiveNotifications = false;

        user.save(function(err) {
          if (err) {
            return done({ msg: err.message });
          }
          done();
        });
      });
    }
  ], function(err) {
    if (err) {
      req.flash('errors', err);
    } else {
      req.flash('success', { msg: 'Вы успешно отписались.' });
    }
    res.redirect('/');
  });
};

exports.dbPreload = utils.dbPreload({
  count: User.count.bind(User),
  mockEntities: mockUsers,
  entityConstructor: User,
  entityName: "User"
});
