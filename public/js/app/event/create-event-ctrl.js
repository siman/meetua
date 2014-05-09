'use strict';

angular.module('myApp')
    .controller('CreateEventCtrl', ['$scope', '$timeout', '$http', 'KIEV_MAP', 'BASE_MAP',
    '$window', 'EventImageService',
    function($scope, $timeout, $http, KIEV_MAP, BASE_MAP, $window, EventImageService) {
        var imageService = $scope.imageService = EventImageService.create({
          scope: $scope,
          onAllUploaded: function submitAfterUpload(uploadedImages) {
            doSendPost(buildReqData(uploadedImages));
          }
        });
        var uploader = $scope.uploader = imageService.uploader;

        $scope.event = {};
        // FIXME remove copy-paste and extract into directive when activity will have new design
        $scope.onActClick = function(act) {
            if (act === $scope.event.activity) {
                $scope.event.activity = undefined;
            } else {
                $scope.event.activity = act;
            }
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
        function doSendPost(requestData) {
            $http.post('/event/create', requestData).success(function(res){
                console.log('Event is created successfully ', res);
                var redirectUrl = '/event/' + res.event._id;
                console.log('Redirecting to ', redirectUrl);
                $window.location = redirectUrl;
            }).error(function(err) {
                    console.error('Failed to create event ', err);
                });
        }
        function updateMapLatLng(lat, lng) {
            $scope.event.place.latitude = lat;
            $scope.event.place.longitude = lng;
        }
    }]);