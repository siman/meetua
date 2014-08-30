'use strict';
/**
 * Created by oleksandr at 8/10/14 5:42 PM
 */
angular.module('myApp')
  .controller('AccountSettingsCtrl', ['$scope', 'activities', '$http', 'util', 'ErrorService', '$alert',
    function($scope, activities, $http, util, ErrorService, $alert) {
    $scope.activities = activities;
    $scope.msg = [];
    $scope.updateProfile = function() {
      $http.post(util.apiUrl('/user/updateProfile'), $scope.currentUser).success(function(res) {
        $alert({content: 'Изменения сохранены.'});
      }).error(function(res) {
        ErrorService.handleResponse(res);
      });
    };
  }]);