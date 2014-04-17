'use strict';

var baseMap = {
  draggable: true,
  zoom: 16,
  opts: {
    scrollwheel: false
  }
};

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

      // Zoom map on Kiev.
      $scope.map = _.extend(baseMap, {
        center: {
          latitude: 50.440646,
          longitude: 30.521018
        },
        zoom: 11
      });

      $scope.mapEvents = [];

      $scope.onEventOver = function(event) {
        $scope.mapEvents = [event];
      };

      $scope.onEventOut = function(event) {
        $scope.mapEvents = $scope.foundEvents;
      };

      $scope.viewEvent = function(event) {
        window.location = "/event/" + event.id;
      };

      $scope.onActClick = function(actName) {
        if (actName === $scope.selectedAct) {
          actName = undefined;
        }
        $scope.selectedAct = actName;
        console.log("actName", actName);
        findEvents(actName);
      };

      function init() {
        findEvents();
      }

      function findEvents(actName) {
        var params = _.isUndefined(actName) ? {} : {act: actName};
        $http({method: 'GET', url: '/event/find', params: params}).
          success(function(data, status, headers, config) {
            $scope.foundEvents = data;
            $scope.mapEvents = data;
            console.log('selected events ', $scope.foundEvents);
          }).
          error(function(data, status, headers, config) {
            console.error('failed to find events by ' + actName, data)
          });
      }

      init();
    }])
    .controller('ViewEventCtrl', ['$scope', '$http', function($scope, $http) {
      var event = JSON.parse($("#eventJson").text());
      console.log("Event", event);

      $scope.event = event;

      $scope.map = _.extend(baseMap, {
        center: {
          latitude: event.latitude,
          longitude: event.longitude
        },
        zoom: 16
      });
    }])
;