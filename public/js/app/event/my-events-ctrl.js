'use strict';

angular.module('myApp')
    .controller('MyEventsCtrl', ['$scope', '$http', function($scope, $http) {
        $scope.events = {
            my: [],
            visited: [], // TODO
            going: [] // TODO
        };

        function init() {
            findMyEvents();
        }

        // TODO Copypaste: Extract to common utils.
        $scope.viewEvent = function(event) {
            window.location = "/event/" + event._id;
        };

        function findMyEvents() {
            var params = {};
            // TODO: Extract method to build API URL using base '/api/meetua/'
            $http({method: 'GET', url: '/api/meetua/events/my', params: params}).
                success(function(data, status, headers, config) {
                    $scope.events.my = data;
                    console.log('Found my events', data);
                }).
                error(function(data, status, headers, config) {
                    console.error('Failed to find my events', data);
                });
        }

        init();
    }]);
