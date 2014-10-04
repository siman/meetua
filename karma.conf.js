'use strict';

/**
 * Module dependencies.
 */
// Karma configuration
module.exports = function(config) {
  config.set({
    // Frameworks to use
    frameworks: ['mocha', 'chai'],
    client: {
      mocha: {
        ui: 'tdd'
      }
    },

    // FIXME copy-pasted from includes.js, but we need to centralize this list somehow
    // step by step we will come to the app structure of MEAN.JS
    files:
     ['http://maps.googleapis.com/maps/api/js?libraries=places&sensor=false',
      'public/lib/jquery/dist/jquery.min.js',
      'public/lib/moment/min/moment.min.js',
      'public/lib/moment/locale/ru.js',
      'public/lib/bootstrap/dist/js/bootstrap.min.js',
      'public/lib/underscore/underscore-min.js',
      'public/lib/angular/angular.min.js',
      'public/lib/angular-i18n/angular-locale_ru-ru.js',
      'public/lib/angular-route/angular-route.min.js',
      'public/lib/angular-resource/angular-resource.min.js',
      'public/lib/angular-cookies/angular-cookies.min.js',
      'public/lib/angular-animate/angular-animate.min.js',
      'public/lib/angular-sanitize/angular-sanitize.min.js',
      'public/lib/angular-http-auth/src/http-auth-interceptor.js',
      'public/lib/angular-file-upload/angular-file-upload.min.js',
      'public/lib/angular-google-maps/dist/angular-google-maps.min.js',
      'public/lib/angular-strap/dist/angular-strap.min.js',
      'public/lib/angular-strap/dist/angular-strap.tpl.min.js',
      'public/lib/summernote/dist/summernote.min.js',
      'public/lib/angular-summernote/dist/angular-summernote.min.js',
      'public/lib/angular-md5/angular-md5.min.js',
      'public/lib/angular-mocks/angular-mocks.js', // test-specific dependency
      'public/js/my-app.js',
      'public/js/app/**/*.js',
      'public/js/test/**/*.js'],

    // Test results reporter to use
    // Possible values: 'mocha', 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['mocha'],

    // Web server port
    port: 9876,

    // Enable / disable colors in the output (reporters and logs)
    colors: true,

    // Level of logging
    // Possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['PhantomJS'],

    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,

    // Continuous Integration mode
    // If true, it capture browsers, run tests and exit
    singleRun: true
  });
};