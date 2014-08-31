'use strict';

// Declare app level module which depends on filters, and services
angular.module('myApp', [
    'ngRoute',
    'myApp.shared',
    'ngAutocomplete', /*google places autocomplete*/
    'ngAnimate',
    'ngSanitize', // dependency of angular-motion
    'angularFileUpload',
    'google-maps',
    'ngCookies',
    'mgcrea.ngStrap', /*angularstrap*/
    'http-auth-interceptor',
    'summernote' /*wysiwyg*/
  ]).run(function () {
    moment.lang('ru');
    console.log('momentjs lang ', moment.lang());
  })
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/view1', {templateUrl: 'partials/partial1.html', controller: 'MyCtrl1'});
    $routeProvider.when('/view2', {templateUrl: 'partials/partial2.html', controller: 'MyCtrl2'});
    $routeProvider.otherwise({redirectTo: '/view1'});
  }])
  .config(['$datepickerProvider', function ($datepickerProvider) {
    angular.extend($datepickerProvider.defaults, {
      autoclose: true
    });
  }])
  .constant('API_BASE_URL', '/api/meetua')
  .constant('BASE_MAP', {
    draggable: true,
    zoom: 16,
    opts: {
      scrollwheel: false
    }
  })
  .constant('KIEV_MAP', {
    center: {
      latitude: 50.440646,
      longitude: 30.521018
    },
    zoom: 11
  })
  .constant('WYSIWYG_OPTIONS', {
    toolbar: [
      ['style', ['style', 'bold', 'italic', 'clear']],
      ['para', ['ul', 'ol']],
      // temp. disable insert buttons, since they don't get update to the model correctly
      // @see the issue https://github.com/outsideris/angular-summernote/issues/15
      // enable when the issue is resolved
      /*['insert', ['picture', 'link', 'video', 'table']],*/
      ['misc', ['help']]
    ],
    disableDragAndDrop: true
  })
  .config(['$alertProvider', function($alertProvider) {
    angular.extend($alertProvider.defaults, {
      animation: 'am-fade-and-slide-top',
      placement: 'top-right',
      container: '#flash',
      type: 'info',
      duration: 3 // seconds
    });
  }]);

angular.module('myApp.shared', []);