'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', [
        'ngRoute',
        'myApp.directives',
        'myApp.controllers',
        'myApp.configs',
        'myApp.shared.services',
        'ngBootstrap',
        'ngAutocomplete',
        'angularFileUpload',
        'google-maps',
        'ngCookies',
        'mgcrea.ngStrap'
    ])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/view1', {templateUrl: 'partials/partial1.html', controller: 'MyCtrl1'});
        $routeProvider.when('/view2', {templateUrl: 'partials/partial2.html', controller: 'MyCtrl2'});
        $routeProvider.otherwise({redirectTo: '/view1'});
    }])
    .config(['$datepickerProvider', function($datepickerProvider){
        angular.extend($datepickerProvider.defaults, {
            autoclose: true
        });
    }]);