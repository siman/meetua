'use strict';

angular.module('myApp')
    .controller('EditEventCtrl', ['$scope', 'activities', function($scope, activities) {
      $scope.event = _myInit.event;
      $scope.activities = activities;
  }]);
