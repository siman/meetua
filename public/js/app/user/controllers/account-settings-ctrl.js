'use strict';
/**
 * Created by oleksandr at 8/10/14 5:42 PM
 */
angular.module('myApp')
  .controller('AccountSettingsCtrl', ['$scope', 'activities', '$http', 'util', 'ErrorService', function($scope, activities, $http, util, ErrorService) {
    $scope.activities = activities;
    var user = $scope.currentUser;
    $scope.account = {
      email: user.email,
      name: user.profile.name,
      gender: user.profile.gender,
      location: user.profile.location,
      website: user.profile.website,
      receiveNotifications: user.profile.receiveNotifications,
      preferredActivities: user.profile.preferredActivities
    };
    $scope.msg = [];
    $scope.updateProfile = function() {
      $http.post(util.apiUrl('/user/updateProfile'), $scope.account).success(function(res) {
        $scope.msg = 'Изменения сохранены.';
      }).error(function(res) {
        ErrorService.handleResponse(res);
      });
    };
  }]);