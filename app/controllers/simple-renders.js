/**
 * Created by oleksandr on 9/5/14.
 */
var passportConf = require('../../config/passport');

module.exports = [
  { url: '/api', view: 'api/index', title: 'API Browser' },
  { url: '/feedback', view: 'feedback', title: 'Отзывы и предложения' },
  { url: '/', view: 'home' },
  { url: '/signup', view: 'account/signup', title: 'Создать аккаунт' },
  { url: '/account', view: 'account/profile', title: 'Личные данные', pre: passportConf.isAuthenticated },
  { url: '/forgot', view: 'account/forgot', title: 'Восстановление пароля' },
  { url: '/event/create', view: 'event/create', title: 'Создать событие' },
  { url: '/profile/my-events', view: 'profile/my-events', title: 'Мои события', pre: passportConf.isAuthenticated }
];