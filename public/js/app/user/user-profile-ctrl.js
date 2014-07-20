'use strict';
/**
 * Created by oleksandr at 7/20/14 7:35 PM
 */
angular.module('myApp')
  .controller('UserProfileCtrl', ['$scope', 'ErrorService', '$http', function($scope, ErrorService, $http) {
    $scope.userProfile = _myInit.userProfile;
    $http.get('/api/meetua/events/user/' + $scope.userProfile._id + '/overview').success(function(resp) {
      $scope.events = resp;
    }).error(function(resp) {
        ErrorService.alert(resp);
    });
  }]);