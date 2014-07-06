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
var notifyService = require('./controllers/util/notification-service');
var OpenShiftApp = require('./openshift');

/**
 * Load controllers.
 */

var appConfig = require('./config/app-config');
var sitemap = require('./controllers/sitemap');
sitemap.scheduleSitemapRebuild(1000 * 60 * 60 * 24); // 1 day
var homeController = require('./controllers/home');
var userController = require('./controllers/user');
var apiController = require('./controllers/api');
var createEventPage = require('./controllers/event/create-page');
var saveEvent = require('./controllers/event/save-event');
var viewEvent = require('./controllers/event/view');
var editEvent = require('./controllers/event/edit');
var cancelEvent = require('./controllers/event/cancel');
var upload = require('./controllers/upload').handleUpload;
var myEvents = require('./controllers/profile/my-events');
var rmEventImage = require('./controllers/event/rm-image');

var eventStore = require('./controllers/event/EventStore');

var renderTpl = require('./controllers/render-tpl').renderTpl;

/**
 * API keys + Passport configuration.
 */

var secrets = require('./config/secrets');
var passportConf = require('./config/passport');

var app = express();

app.set('port', appConfig.IS_PRODUCTION ? 80 : 3000); // TODO refactor to use appConfig instead of plain strings
app.set('mongodb-url', secrets.db);

var openShiftApp = new OpenShiftApp();
openShiftApp.initialize(app);

secrets.db = app.get('mongodb-url');

app.response.renderNotFound = function() {
  this.render('404', { status: 404 });
};

/**
 * Express configuration.
 */

var hour = 3600000;
var day = (hour * 24);
var month = (day * 30);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(connectAssets({
  paths: ['public/css', 'public/js'],
  helperContext: app.locals,
  build: appConfig.IS_PRODUCTION || openShiftApp.isOpenShiftEnv()
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
app.use(express.csrf());
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
app.use(express.errorHandler());

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

app.get('/', homeController.index);
app.get('/sitemap.xml', sitemap.getSitemap);
app.get('/login', userController.getLogin);
app.post('/login', userController.postLogin);
app.get('/logout', userController.logout);
app.get('/forgot', userController.getForgot);
app.post('/forgot', userController.postForgot);
app.get('/reset/:token', userController.getReset);
app.post('/reset/:token', userController.postReset);
app.get('/signup', userController.getSignup);
app.post('/signup', userController.postSignup);
app.get('/account', passportConf.isAuthenticated, userController.getAccount);
app.post('/account/profile', passportConf.isAuthenticated, userController.postUpdateProfile);
app.post('/account/password', passportConf.isAuthenticated, userController.postUpdatePassword);
app.post('/account/delete', passportConf.isAuthenticated, userController.postDeleteAccount);
app.get('/account/unlink/:provider', passportConf.isAuthenticated, userController.getOauthUnlink);
app.get('/account/unsubscribe/:email/:token', userController.getUnsubscribe);
app.get('/api', apiController.getApi);
app.get('/api/lastfm', apiController.getLastfm);
app.get('/api/nyt', apiController.getNewYorkTimes);
app.get('/api/aviary', apiController.getAviary);
app.get('/api/paypal', apiController.getPayPal);
app.get('/api/paypal/success', apiController.getPayPalSuccess);
app.get('/api/paypal/cancel', apiController.getPayPalCancel);
app.get('/api/steam', apiController.getSteam);
app.get('/api/scraping', apiController.getScraping);
app.get('/api/twilio', apiController.getTwilio);
app.post('/api/twilio', apiController.postTwilio);
app.get('/api/clockwork', apiController.getClockwork);
app.post('/api/clockwork', apiController.postClockwork);
app.get('/api/foursquare', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getFoursquare);
app.get('/api/tumblr', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getTumblr);
app.get('/api/facebook', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getFacebook);
app.get('/api/github', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getGithub);
app.get('/api/twitter', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getTwitter);
app.get('/api/venmo', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getVenmo);
app.post('/api/venmo', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.postVenmo);
app.get('/api/linkedin', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getLinkedin);

var feedback = require('./controllers/feedback');
app.get('/tpl/*', renderTpl);
app.get('/feedback', feedback.get_feedback);
app.get('/event/create', passportConf.isAuthenticated, createEventPage);
app.post('/event/save', passportConf.isAuthenticated, saveEvent);
app.get('/event/:id', viewEvent);
app.get('/event/:id/edit', passportConf.isAuthenticated, editEvent);          // TODO move rest calls under /api/meetua
app.get('/event/:id/cancel', passportConf.isAuthenticated, cancelEvent);
app.post('/event/:id/rm-image/:imageId', passportConf.isAuthenticated, rmEventImage);
app.post('/upload/image', passportConf.isAuthenticated, upload);
app.get('/profile/my-events', passportConf.isAuthenticated, myEvents);

// MeetUA API
var meetuaEventsApi = require('./controllers/api/events');
app.post('/api/meetua/user/login', userController.api.postLoginRest);
app.get('/api/meetua/user/getCurrent', userController.api.getCurrentUser);
app.get('/api/meetua/events/find', meetuaEventsApi.get_find); // TODO rename events -> event to keep routing consistency
app.get('/api/meetua/events/findById', meetuaEventsApi.get_findById);
app.get('/api/meetua/events/my', passportConf.isAuthenticatedRest, meetuaEventsApi.get_my);
app.get('/api/meetua/events/myOverview', passportConf.isAuthenticatedRest, meetuaEventsApi.get_myOverview);
app.post('/api/meetua/events/participation', passportConf.isAuthenticatedRest, meetuaEventsApi.post_participation);
if (!appConfig.IS_PRODUCTION) {
  var devApi = require('./controllers/api/dev');
  app.get('/dev-api', function(req, res, next) {
    res.render('dev-api', { title: 'MeetUA API' });
  });
  app.post('/api/meetua/notify/participant-on-join', passportConf.isAuthenticatedRest, devApi.postNotifyParticipantOnJoin);
  app.post('/api/meetua/notify/participant-on-edit', passportConf.isAuthenticatedRest, devApi.postNotifyParticipantOnEdit);
  app.post('/api/meetua/notify/user-forgot-password', passportConf.isAuthenticatedRest, devApi.postNotifyUserForgotPassword);
  app.post('/api/meetua/notify/user-password-reset', passportConf.isAuthenticatedRest, devApi.postNotifyUserPasswordReset);
  app.post('/api/meetua/notify/author-on-create', passportConf.isAuthenticatedRest, devApi.postNotifyAuthorOnCreate);
  app.post('/api/meetua/notify/coming-soon', passportConf.isAuthenticatedRest, devApi.postNotifyComingSoonEvent);
  app.post('/api/meetua/notify/on-cancel', passportConf.isAuthenticatedRest, devApi.postNotifyOnCancel);
}

/**
 * OAuth routes for sign-in.
 */

app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'user_location'] }));
app.get('/auth/facebook/callback', passport.authenticate('facebook', { successRedirect: '/auth/success', failureRedirect: '/login' }));
app.get('/auth/success', function(req, res) {
  res.render('after-auth');
});
app.get('/auth/vkontakte', passport.authenticate('vkontakte', { scope: ['email'] }));
app.get('/auth/vkontakte/callback', passport.authenticate('vkontakte', { successRedirect: '/auth/success', failureRedirect: '/login' }));
app.get('/auth/github', passport.authenticate('github'));
app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), function(req, res) {
  res.redirect(req.session.returnTo || '/');
});
app.get('/auth/google', passport.authenticate('google', { scope: 'profile email' }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), function(req, res) {
  res.redirect(req.session.returnTo || '/');
});
app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/login' }), function(req, res) {
  res.redirect(req.session.returnTo || '/');
});
app.get('/auth/linkedin', passport.authenticate('linkedin', { state: 'SOME STATE' }));
app.get('/auth/linkedin/callback', passport.authenticate('linkedin', { failureRedirect: '/login' }), function(req, res) {
  res.redirect(req.session.returnTo || '/');
});

/**
 * OAuth routes for API examples that require authorization.
 */

app.get('/auth/foursquare', passport.authorize('foursquare'));
app.get('/auth/foursquare/callback', passport.authorize('foursquare', { failureRedirect: '/api' }), function(req, res) {
  res.redirect('/api/foursquare');
});
app.get('/auth/tumblr', passport.authorize('tumblr'));
app.get('/auth/tumblr/callback', passport.authorize('tumblr', { failureRedirect: '/api' }), function(req, res) {
  res.redirect('/api/tumblr');
});
app.get('/auth/venmo', passport.authorize('venmo', { scope: 'make_payments access_profile access_balance access_email access_phone' }));
app.get('/auth/venmo/callback', passport.authorize('venmo', { failureRedirect: '/api' }), function(req, res) {
  res.redirect('/api/venmo');
});

/**
 * Start Express server.
 */

app.listen(app.get('port'), function() {
  console.log("✔ Express server listening on port %d in %s mode", app.get('port'), app.get('env'));
});

/**
 * Mongoose configuration.
 */

mongoose.connect(app.get('mongodb-url'));
mongoose.connection.on('error', function() {
  console.error('✗ MongoDB Connection Error. Please make sure MongoDB is running.');
});

if (!openShiftApp.isOpenShiftEnv()) {
  // DB preloading
  eventStore.dbPreload();
  userController.dbPreload();
}

notifyService.startCronJobs();

module.exports = app;
