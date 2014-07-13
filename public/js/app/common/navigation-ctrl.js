'use strict';
/**
 * Created by oleksandr at 7/13/14 2:42 PM
 */
angular.module('myApp')
  .controller('NavigationCtrl', ['$scope', '$http', 'util', function($scope, $http, util) {
    $scope.login = function() {
      $http.get(util.apiUrl('/user/login')).success(function(resp) {
        console.log('successfully logged in');
      });
    }
  }]);