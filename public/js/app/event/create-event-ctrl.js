'use strict';

angular.module('myApp')
    .controller('CreateEventCtrl', ['$scope', '$http', '$window', 'EventImageService', 'activities',
    function($scope, $http, $window, EventImageService, activities) {
        var imageService = $scope.imageService = EventImageService.create({
          scope: $scope,
          onAllUploaded: function submitAfterUpload(uploadedImages) {
            doSendPost(buildReqData(uploadedImages));
          }
        });
        var uploader = $scope.uploader = imageService.uploader;
        $scope.activities = activities;
        $scope.event = {};
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