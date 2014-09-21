'use strict';
/**
 * Created by oleksandr at 7/20/14 7:35 PM
 */
angular.module('myApp')
  .controller('UserProfileCtrl', ['$scope', 'ErrorService', '$http', function($scope, ErrorService, $http) {
    $scope.userProfile = _myInit.userProfile;
    $scope.app.EventsService.getEventsOverview($scope.userProfile._id, function(res) {
      $scope.events = res;
    });
  }]);