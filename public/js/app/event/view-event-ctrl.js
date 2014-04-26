'use strict';

angular.module('myApp')
    .controller('ViewEventCtrl', ['$scope', '$http', 'BASE_MAP', 'eventFormatDateService',
    function($scope, $http, BASE_MAP, eventFormatDateService) {
        var event = JSON.parse($("#eventJson").text());
        eventFormatDateService.addDisplayData(event);
        console.log("Event", event);

        $scope.event = event;

        $scope.map = _.extend(BASE_MAP, {
            center: {
                latitude: event.place.latitude,
                longitude: event.place.longitude
            },
            zoom: 16
        });
    }]);