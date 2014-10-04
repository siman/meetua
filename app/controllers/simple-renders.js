'use strict';

/**
 * Created by oleksandr on 9/5/14.
 */

var passportConf = require('../../config/passport');

module.exports = [
  { url: '/', view: 'home', params: {} },
  { url: '/feedback', view: 'feedback', params: {title: 'Отзывы и предложения'} },
  { url: '/signup', view: 'account/signup', params: {title: 'Создать аккаунт'} },
  { url: '/account', view: 'account/profile', pre: passportConf.isAuthenticated, params: {title: 'Личные данные'} },
  { url: '/forgot', view: 'account/forgot', params: {title: 'Восстановление пароля'} },
  { url: '/event/create', view: 'event/create', params: {title: 'Создать событие'} },
  { url: '/profile/my-events', view: 'profile/my-events', pre: passportConf.isAuthenticated, params: {title: 'Мои события'} },
  { url: '/dev/users', view: 'dev/users', pre: passportConf.isAuthenticated, params: {title: 'Users'} }
];