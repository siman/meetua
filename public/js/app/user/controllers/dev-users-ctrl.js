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

    $scope.isUserMyFriend = function(user) {
      // TODO: Copypasted: See view-event-ctrl.js
      return _.find($scope.currentUser.profile.friends, function(friend) {
        return friend._id === user._id;
      });
    };

    $scope.changeFriendship = function(user) {
      $http.post('/dev/users/changeFriendship/' + user._id, {}).
        success(function(data, status, headers, config) {
          $scope.currentUser = data.currentUser;
        }).
        error(function(data, status, headers, config) {
          ErrorService.handleResponse(data);
        });
    };

    init();
  }]);