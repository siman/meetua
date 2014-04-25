'use strict';

angular.module('myApp')
    .controller('EditEventCtrl', ['$scope', function($scope) {
        $scope.init = function(event) {
            $scope.event = event;
        };
    }]);
