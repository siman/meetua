'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
    .controller('CreateEventCtrl', ['$scope', '$fileUploader', '$cookies', function($scope, $fileUploader, $cookies) {
        var uploader = $scope.uploader = $fileUploader.create({
            scope: $scope,
            url: '/upload/image',
            autoUpload: true,
            headers: {
                'X-CSRF-TOKEN': $cookies['XSRF-TOKEN']
            }
        });

        // Images only
        uploader.filters.push(function(item /*{File|HTMLInputElement}*/) {
            var type = uploader.isHTML5 ? item.type : '/' + item.value.slice(item.value.lastIndexOf('.') + 1);
            type = '|' + type.toLowerCase().slice(type.lastIndexOf('/') + 1) + '|';
            return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
        });
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
          latitude: 50.440646,
          longitude: 30.521018
        },
        zoom: 11
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
    }]);