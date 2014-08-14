/**
 * Module dependencies.
 */

var express = require('express');
var MongoStore = require('connect-mongo')(express);
var flash = require('express-flash');
var path = require('path');
var mongoose = require('mongoose');
var passport = require('passport');
var expressValidator = require('express-validator');
var connectAssets = require('connect-assets');
var _ = require('underscore');
var notifyService = require('./app/controllers/util/notification-service');
var errorHandler = require('./app/controllers/util/error-handler');

/**
 * Load controllers.
 */

var appConfig = require('./config/app-config');
var sitemap = require('./app/controllers/sitemap');
sitemap.scheduleSitemapRebuild(1000 * 60 * 60 * 24); // 1 day
var homeController = require('./app/controllers/home');
var userController = require('./app/controllers/user');
var apiController = require('./app/controllers/api');
var createEventPage = require('./app/controllers/event/create-page');
var saveEvent = require('./app/controllers/event/save-event');
var viewEvent = require('./app/controllers/event/view');
var editEvent = require('./app/controllers/event/edit');
var cancelEvent = require('./app/controllers/event/cancel');
var upload = require('./app/controllers/upload').handleUpload;
var myEvents = require('./app/controllers/profile/my-events');
var rmEventImage = require('./app/controllers/event/rm-image');

var eventStore = require('./app/controllers/event/EventStore');

var renderTpl = require('./app/controllers/render-tpl').renderTpl;

/**
 * API keys + Passport configuration.
 */

var secrets = appConfig.secrets;
var passportConf = require('./config/passport');

var app = express();

app.response.renderNotFound = function() {
  this.render('404', { status: 404 });
};

/**
 * Express configuration.
 */

var hour = 3600000;
var day = (hour * 24);
var month = (day * 30);

app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'jade');
app.use(connectAssets({
  paths: ['public/css', 'public/js'],
  helperContext: app.locals,
  build: appConfig.buildAssets
}));
app.use(express.compress());
app.use(express.logger('dev'));
app.use(express.cookieParser());
app.use(express.json());
app.use(express.urlencoded());
app.use(expressValidator());
app.use(express.methodOverride());
app.use(express.session({
  secret: secrets.sessionSecret,
  store: new MongoStore({
    url: secrets.db,
    auto_reconnect: true
  })
}));
if (appConfig.enableCsrf) {
  app.use(express.csrf());
} else {
  app.use(function(req, res, next) {
    req.csrfToken = function() {return '';};
    next();
  });
}
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next) {
  res.locals.user = req.user;
  res.locals._csrf = req.csrfToken();
  res.locals.secrets = secrets;
  res.locals.appConfig = appConfig;
  res.cookie('XSRF-TOKEN', req.csrfToken());
  next();
});
app.use(flash());
app.use(express.static(path.join(__dirname, 'public'), { maxAge: month }));

// Set of next headers should be after middleware for static serving
// because we want cache for static assets but not for dynamic pages
// as API responses or view event page.
app.use(headersForLanguage);
app.use(headersForNoCache);

app.use(function(req, res, next) {
  // Keep track of previous URL
  if (req.method !== 'GET') return next();
  var path = req.path.split('/')[1];
  if (/(auth|login|logout|signup)$/i.test(path)) return next();
  var returnTo = req.path.indexOf('/assets') === 0 || req.path.indexOf('/favicon.ico') === 0 ? '/' : req.path; // ignore assets requests
  req.session.returnTo = returnTo;
  next();
});
app.use(app.router);
app.use(function(req, res) {
  res.renderNotFound();
});
app.use(appConfig.IS_PRODUCTION ? errorHandler.error : express.errorHandler());

/** Use when you don't want browser to cache the request (e.g. on back button click) */
function headersForNoCache(req, res, next) {
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-age=0');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
}

function headersForLanguage(req, res, next) {
  res.header('Content-Language', 'ru');
  next();
}

/**
 * Application routes.
 */

app.param('userId', userController.userById);
app.get('/', homeController.index);
app.get('/sitemap.xml', sitemap.getSitemap);
app.get('/logout', userController.logout);
app.get('/forgot', userController.getForgot);
app.post('/forgot', userController.postForgot);
app.get('/reset/:token', userController.getReset);
app.post('/reset/:token', userController.postReset);
app.get('/signup', userController.getSignup);
app.post('/signup', userController.postSignup);
app.get('/account', passportConf.isAuthenticated, userController.getAccount);
app.post('/account/password', passportConf.isAuthenticated, userController.postUpdatePassword);
app.post('/account/delete', passportConf.isAuthenticated, userController.postDeleteAccount);
app.get('/account/unlink/:provider', passportConf.isAuthenticated, userController.getOauthUnlink);
app.get('/account/unsubscribe/:email/:token', userController.getUnsubscribe);
app.get('/api', apiController.getApi);
app.get('/api/facebook', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getFacebook);

var feedback = require('./app/controllers/feedback');
app.get('/tpl/*', renderTpl);
app.get('/feedback', feedback.get_feedback);
app.get('/event/create', createEventPage);
app.post('/event/save', passportConf.isAuthenticated, saveEvent);
app.get('/event/:id', viewEvent);
app.get('/event/:id/edit', passportConf.isAuthenticated, editEvent);          // TODO move rest calls under /api/meetua
app.get('/event/:id/cancel', passportConf.isAuthenticated, cancelEvent);
app.post('/event/:id/rm-image/:imageId', rmEventImage);
app.get('/user/:userId', userController.getUserProfile)
app.post('/upload/image', passportConf.isAuthenticated, upload);
app.get('/profile/my-events', passportConf.isAuthenticated, myEvents);

// MeetUA API
var meetuaEventsApi = require('./app/controllers/api/events');

// User
app.get('/api/meetua/user/login', passportConf.isAuthenticated, userController.api.getLogin); // authenticates user through auth-modal
app.post('/api/meetua/user/login', userController.api.postLoginRest);
app.get('/api/meetua/user/getCurrent', userController.api.getCurrentUser);
app.post('/api/meetua/user/notifications', passportConf.isAuthenticated, userController.api.postSetupUserNotifications);
app.post('/api/meetua/user/updateProfile', passportConf.isAuthenticated, userController.api.postUpdateProfile);

// Event
// TODO rename events -> event to keep routing consistency
app.get('/api/meetua/events/find', meetuaEventsApi.get_find);
app.get('/api/meetua/events/findById', meetuaEventsApi.get_findById);
app.get('/api/meetua/events/my', passportConf.isAuthenticated, meetuaEventsApi.get_my);
app.get('/api/meetua/events/myOverview', passportConf.isAuthenticated, meetuaEventsApi.get_myOverview);
app.get('/api/meetua/events/user/:userId/overview', meetuaEventsApi.getUserEventsOverview);
app.post('/api/meetua/events/participation', passportConf.isAuthenticated, meetuaEventsApi.post_participation);

if (appConfig.IS_DEVELOPMENT) {
  var devApi = require('./app/controllers/api/dev');
  app.get('/dev-api', function(req, res, next) {
    res.render('dev-api', { title: 'MeetUA API' });
  });
  app.post('/api/meetua/notify/participant-on-join', passportConf.isAuthenticated, devApi.postNotifyParticipantOnJoin);
  app.post('/api/meetua/notify/participant-on-edit', passportConf.isAuthenticated, devApi.postNotifyParticipantOnEdit);
  app.post('/api/meetua/notify/user-forgot-password', passportConf.isAuthenticated, devApi.postNotifyUserForgotPassword);
  app.post('/api/meetua/notify/user-password-reset', passportConf.isAuthenticated, devApi.postNotifyUserPasswordReset);
  app.post('/api/meetua/notify/author-on-create', passportConf.isAuthenticated, devApi.postNotifyAuthorOnCreate);
  app.post('/api/meetua/notify/coming-soon', passportConf.isAuthenticated, devApi.postNotifyComingSoonEvent);
  app.post('/api/meetua/notify/on-cancel', passportConf.isAuthenticated, devApi.postNotifyOnCancel);
}

/**
 * OAuth routes for sign-in.
 */

app.get('/auth/success', function(req, res) {
  res.render('after-auth');
});
var authSuccessHandler = function(req, res) {
  var referer = req.headers.referer;
  if (referer.indexOf('/account') !== -1) {
    res.redirect(referer); // link account request
  } else {
    res.redirect('/auth/success');
  }
};
app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'user_location'] }));
app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), authSuccessHandler);
app.get('/auth/vkontakte', passport.authenticate('vkontakte', { scope: ['email'] }));
app.get('/auth/vkontakte/callback', passport.authenticate('vkontakte', { failureRedirect: '/login' }), authSuccessHandler);

/**
 * error trigger(development mode only)
 */
if (appConfig.IS_DEVELOPMENT) {
  app.get('/dev/error', errorHandler.errorGenerator);
}


/**
 * Start Express server.
 */

app.listen(appConfig.port, function() {
  console.log("✔ Express server listening on port %d in %s mode", appConfig.port, app.get('env'));
});

/**
 * Mongoose configuration.
 */

console.log('mongo connect to ' + secrets.db);
mongoose.connect(secrets.db);
mongoose.connection.on('error', function() {
  console.error('✗ MongoDB Connection Error. Please make sure MongoDB is running.');
});

// DB preloading
eventStore.dbPreload();
userController.dbPreload();

notifyService.startCronJobs();

module.exports = app;