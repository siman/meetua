'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
    .controller('CreateEventCtrl', ['$scope', function($scope) {
        $scope.submit = function() {

        };
        $scope.placesOptions={
            country: 'ua'
        };
    }])
    .controller('SelectEventCtrl', ['$scope', function($scope) {
      $scope.selectedActs = {
        bike: false,
        running: false,
        workout: false,
        hiking: false,
        photo: false,
        en: false,
        code: false
      };

      $scope.onActClick = function(actName) {
        $scope.selectedActs[actName] = !$scope.selectedActs[actName];
        console.log("selectedActs", $scope.selectedActs);
      }
    }])
    .controller('MyCtrl2', [function() {

    }]);