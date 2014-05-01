'use strict';

angular.module('myApp')
    .controller('MyEventsCtrl', ['$scope', '$http', function($scope, $http) {
        $scope.events = {
            my: [],
            visited: [],
            going: []
        };

        function init() {
            findMyEvents();
        }

        // TODO Copypaste: Extract to common utils.
        $scope.viewEvent = function(event) {
            window.location = "/event/" + event._id;
        };

        function findMyEvents() {
            function findMyEvents(type) {
              // TODO: Extract method to build API URL using base '/api/meetua/'
              var params = {type: type};
              $http({method: 'GET', url: '/api/meetua/events/my', params: params}).
                success(function(data, status, headers, config) {
                  $scope.events[type] = data;
                  console.log('Found ' + type + ' events', data);
                }).
                error(function(data, status, headers, config) {
                  console.error('Failed to find ' + type + ' events', data);
                });
            }

            findMyEvents('my');
            findMyEvents('going');
            findMyEvents('visited');
        }

        init();
    }]);
