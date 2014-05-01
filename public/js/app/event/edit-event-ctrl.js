'use strict';

angular.module('myApp')
    .controller('EditEventCtrl', ['$scope', function($scope) {
        $scope.event = _myInit.event;
    }]);
