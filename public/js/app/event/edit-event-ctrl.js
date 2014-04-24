'use strict';

angular.module('myApp.controllers')
    .controller('EditEventCtrl', ['$scope', function($scope) {
        $scope.init = function(event) {
            $scope.event = event;
        };
    }]);
