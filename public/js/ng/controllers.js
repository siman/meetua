'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
    .controller('CreateEventCtrl', ['$scope', '$fileUploader', '$cookies', 'KIEV_MAP', 'BASE_MAP',
        function($scope, $fileUploader, $cookies, KIEV_MAP, BASE_MAP) {
        var uploader = $scope.uploader = $fileUploader.create({
            scope: $scope,
            url: '/upload/image',
            headers: {
                'X-CSRF-TOKEN': $cookies['XSRF-TOKEN']
            },
            queueLimit: 5 // possible images count
        });

        // Images only
        uploader.filters.push(function(item /*{File|HTMLInputElement}*/) {
            var type = uploader.isHTML5 ? item.type : '/' + item.value.slice(item.value.lastIndexOf('.') + 1);
            type = '|' + type.toLowerCase().slice(type.lastIndexOf('/') + 1) + '|';
            return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
        });
        uploader.bind('afteraddingfile', function(e, item){
            // first img is logo by default
            if (uploader.queue.length === 1) {
                item.isLogo = true;
            }
        });
        $scope.setAsLogo = function(item) {
            function disableLogo(item) {
                item.isLogo = false;
            }
            _.each(uploader.queue, disableLogo);
            item.isLogo = true;
        };
        $scope.submit = function() {
          var event = $scope.event;
          alert(JSON.stringify(event));
        };
        $scope.placeMap = _.extend(BASE_MAP, KIEV_MAP);
        $scope.$watch('event.place.details', function(details){
            if (details) {
                $scope.placeMap.center.latitude = details.geometry.location.lat();
                $scope.placeMap.center.longitude = details.geometry.location.lng();
            }
        });
        $scope.onMarkerDragEnd = function(event) {
            if (event) {
                console.log(event);
            }
        };
        $scope.onMarkerPositionChanged = function(event) {
            if (event) {
                console.log(event);
            }
        };
        $scope.removeItem = function(item){
            uploader.removeFromQueue(item);
            // logo is removed
            if (item.isLogo && uploader.queue.length > 0) {
                uploader.queue[0].isLogo = true; // make first image logo
            }
        };
        $scope.placeOptions={
            country: 'ua'
        };
    }])
    .controller('SelectEventCtrl', ['$scope', '$http', 'KIEV_MAP', 'BASE_MAP',
        function($scope, $http, KIEV_MAP, BASE_MAP) {
      $scope.selectedAct = undefined;

      $scope.foundEvents = [];

      // Zoom map on Kiev.
      $scope.map = _.extend(BASE_MAP, KIEV_MAP);

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
    .controller('ViewEventCtrl', ['$scope', '$http', 'BASE_MAP', function($scope, $http, BASE_MAP) {
      var event = JSON.parse($("#eventJson").text());
      console.log("Event", event);

      $scope.event = event;

      $scope.map = _.extend(BASE_MAP, {
        center: {
          latitude: event.latitude,
          longitude: event.longitude
        },
        zoom: 16
      });
    }])
  .controller('SelectAuthorsEventCtrl', ['$scope', '$http', function($scope, $http) {
    $scope.selectedEvent = undefined;

    $scope.foundEvents = [];

//    $scope.onEventOver = function(event) {
//      $scope.mapEvents = [event];
//    };
//
//    $scope.onEventOut = function(event) {
//      $scope.mapEvents = $scope.foundEvents;
//    };
//
    $scope.viewEvent = function(event) {
      $scope.selectedEvent = event
    };
//
//    $scope.onActClick = function(actName) {
//      if (actName === $scope.selectedAct) {
//        actName = undefined;
//      }
//      $scope.selectedAct = actName;
//      console.log("actName", actName);
//      findEvents(actName);
//    };

    function init() {
      findBy();
    }

    function findBy(paramName, paramValue) {
      var params = _.isUndefined(paramName) ? {} : {paramName: paramValue};
      $http({method: 'GET', url: '/event/find', params: params}).
        success(function(data, status, headers, config) {
          $scope.foundEvents = data;
          console.log('found authors events ', $scope.foundEvents);
        }).
        error(function(data, status, headers, config) {
          console.error('failed to find author events author id: ' + authorId, data)
        });
    }

    init();
  }])
;