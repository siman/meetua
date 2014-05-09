'use strict';

angular.module('myApp')
    .controller('EditEventCtrl', ['$scope', function($scope) {
      $scope.event = _myInit.event;
      // FIXME remove copy-paste and extract into directive when activity will have new design
      $scope.onActClick = function(act) {
        if (act === $scope.event.activity) {
          $scope.event.activity = undefined;
        } else {
          $scope.event.activity = act;
        }
      };
  }]);
