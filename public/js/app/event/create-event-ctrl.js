'use strict';

angular.module('myApp')
    .controller('CreateEventCtrl', ['$scope', '$http', '$window', 'EventImageService',
    function($scope, $http, $window, EventImageService) {
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
    }]);