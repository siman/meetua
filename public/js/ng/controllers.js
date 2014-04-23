'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
    .controller('CreateEventCtrl', ['$scope', '$fileUploader', '$cookies', '$timeout', '$http', 'KIEV_MAP', 'BASE_MAP',
        '$eventService',
        function($scope, $fileUploader, $cookies, $timeout, $http, KIEV_MAP, BASE_MAP, $eventService) {
        console.log('Creating event ', $eventService.createEvent());
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
        uploader.bind('completeall', submitAfterUpload);
        $scope.event = {};
        $scope.onActClick = function(act) {
            if (act === $scope.event.activity) {
                $scope.event.activity = undefined;
            } else {
                $scope.event.activity = act;
            }
        };
        $scope.setAsLogo = function(item) {
            function disableLogo(item) {
                item.isLogo = false;
            }
            _.each(uploader.queue, disableLogo);
            item.isLogo = true;
        };
        $scope.submit = function() {
            if (uploader.queue.length > 0) {
                uploader.uploadAll();
            } else {
                doSendPost(buildReqData());
            }
        };
        $scope.placeMap = _.extend(BASE_MAP, KIEV_MAP, {
            marker: {
                options: {draggable: true},
                events: {
                    dragend: function(event) {
                        $timeout(function(){
                            updateMapLatLng(event.position.lat(), event.position.lng());
                        });
                    }
                }
            }
        });
        $scope.$watch('data.place.details', function(details){
            if (details) {
                updateMapLatLng(details.geometry.location.lat(), details.geometry.location.lng());
                if ($scope.placeMap.zoom == KIEV_MAP.zoom) {
                    $scope.placeMap.zoom = KIEV_MAP.zoom + 4;
                }
            }
        });
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
        function buildReqData(uploadedImages) {
            var reqData = _.extend($scope.event, {
                images: uploadedImages
            });
            console.log('Request data ', reqData);
            return reqData;
        }
        function submitAfterUpload(event, uploadItems, progress) {
            function getItemUploadResponse(item){
                var uploadResponse = JSON.parse(item._xhr.response);
                return _.extend(uploadResponse, {isLogo: item.isLogo});
            }
            var uploadedImages = _.map(uploadItems, getItemUploadResponse);
            var requestData = buildReqData(uploadedImages);
            doSendPost(requestData);
        }
        function doSendPost(requestData) {
            $http.post('/event/create', requestData).success(function(res){
                console.log('Event is created successfully ', res);
            }).error(function(err) {
                console.error('Failed to create event ', err);
            });
        }
        function updateMapLatLng(lat, lng) {
            $scope.event.place.latitude = lat;
            $scope.event.place.longitude = lng;
        }
    }])
    .controller('EditEventCtrl', ['$scope', function($scope) {
        $scope.init = function(event) {
            $scope.event = event;
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
        $scope.mapEvents = [event.place];
      };

      $scope.onEventOut = function(event) {
        $scope.mapEvents = _.map($scope.foundEvents, function(ev) {return ev.place});
      };

      // TODO Copypaste: Extract to common utils.
      $scope.viewEvent = function(event) {
        window.location = "/event/" + event._id;
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
        $http({method: 'GET', url: '/api/meetua/events/find', params: params}).
          success(function(data, status, headers, config) {
            $scope.foundEvents = data;
            $scope.mapEvents = _.map(data, function(ev) {return ev.place});
            console.log('Selected events ', $scope.foundEvents);
          }).
          error(function(data, status, headers, config) {
            console.error('Failed to find events by ' + actName, data);
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
          latitude: event.place.latitude,
          longitude: event.place.longitude
        },
        zoom: 16
      });
    }])
  .controller('SelectAuthorsEventCtrl', ['$scope', '$http', function($scope, $http) {
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
  }])
;