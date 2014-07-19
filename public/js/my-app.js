'use strict';

// Declare app level module which depends on filters, and services
angular.module('myApp', [
    'ngRoute',
    'myApp.shared',
    'ngAutocomplete', /*google places autocomplete*/
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
      ['insert', ['picture', 'link', 'video', 'table']],
      ['misc', ['help']]
    ]
  });

angular.module('myApp.shared', []);