'use strict';

// Declare app level module which depends on filters, and services
angular.module('myApp', [
        'ngRoute',
        'myApp.shared',
        'ngBootstrap',
        'ngAutocomplete',
        'angularFileUpload',
        'google-maps',
        'ngCookies',
        'mgcrea.ngStrap'
    ]).run(function() {
        moment.lang('ru');
        console.log('momentjs lang ', moment.lang());
    })
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/view1', {templateUrl: 'partials/partial1.html', controller: 'MyCtrl1'});
        $routeProvider.when('/view2', {templateUrl: 'partials/partial2.html', controller: 'MyCtrl2'});
        $routeProvider.otherwise({redirectTo: '/view1'});
    }])
    .config(['$datepickerProvider', function($datepickerProvider){
        angular.extend($datepickerProvider.defaults, {
            autoclose: true
        });
    }])
    .constant('API_BASE_URL', '/api/meetua')
    .constant('KIEV_MAP', {
        center: {
            latitude: 50.440646,
            longitude: 30.521018
        },
        zoom: 11
    })
    .constant('BASE_MAP', {
        draggable: true,
        zoom: 16,
        opts: {
            scrollwheel: false
        }
    })
    .constant('activities', [  // TODO move into db in the future
      {name: 'bike', textOver: 'Велосипед'},
      {name: 'running', textOver: 'Бег'},
      {name: 'workout', textOver: 'Workout'},
      {name: 'hiking', textOver: 'Туризм'},
      {name: 'photo', textOver: 'Фото'},
      {name: 'en', textOver: 'Языки'},
      {name: 'code', textOver: 'IT'}
    ]);