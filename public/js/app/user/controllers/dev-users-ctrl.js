'use strict';

angular.module('myApp').controller('DevUsersCtrl',
  ['$rootScope', '$scope', '$http', '$alert', 'util', 'ErrorService',
  function($rootScope, $scope, $http, $alert, util, ErrorService) {

    $scope.users = undefined; // []

    // TODO: by Siman: Impl filtering feature
//    $scope.filter = {
//      real: true,
//      generated: true
//    };

    function init() {
      $scope.find();
    }

    $scope.find = function() {
      $scope.users = undefined;
      $http.get('/dev/users/list', {}).
        success(function(data, status, headers, config) {
          $scope.users = data;
        }).
        error(function(data, status, headers, config) {
          ErrorService.handleResponse(data);
        });
    };

    init();
  }]);