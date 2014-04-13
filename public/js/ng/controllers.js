'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
    .controller('CreateEventCtrl', ['$scope', function($scope) {
        $scope.submit = function() {
          var event = $scope.event;
          event.startDateTime = $scope.event.startDateTime.startDate;
          event.endDateTime = $scope.event.endDateTime.endDate;
          alert(JSON.stringify(event));
        };
        $scope.placesOptions={
            country: 'ua'
        };
    }])
    .controller('SelectEventCtrl', ['$scope', '$http', function($scope, $http) {
      $scope.selectedAct = undefined;

      $scope.foundEvents = [];

      $scope.map = {
        center: {
          latitude: 50.460646,
          longitude: 30.521018
        },
        zoom: 8
      };

      $scope.mapEvents = [];

      $scope.onEventOver = function(event) {
        $scope.mapEvents = [event];
      };

      $scope.onEventOut = function(event) {
        $scope.mapEvents = $scope.foundEvents;
      };

      $scope.onActClick = function(actName) {
        $scope.selectedAct = actName;
        console.log("actName", actName);
        $http({method: 'GET', url: '/event/find', params: {act: actName}}).
          success(function(data, status, headers, config) {
            $scope.foundEvents = data;
            $scope.mapEvents = data;
            console.log('selected events ', $scope.foundEvents);
          }).
          error(function(data, status, headers, config) {
            console.error('failed to find events by ' + actName, data)
          });
      };
    }])
    .controller('MyCtrl2', [function() {

    }]);