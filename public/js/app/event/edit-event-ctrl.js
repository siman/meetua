'use strict';

angular.module('myApp')
    .controller('EditEventCtrl', ['$scope', 'activities', 'EventImageService', '$http', function($scope, activities, EventImageService, $http) {
      $scope.event = _myInit.event;
      $scope.activities = activities;
      var imageService = $scope.imageService = EventImageService.create({
        scope: $scope,
        onAllUploaded: function submitAfterUpload(uploadedImages) {
          doSendPost(buildReqData(uploadedImages));
        },
        uploadedImages: $scope.event.images,
        event: $scope.event
      });
      var uploader = $scope.uploader = imageService.uploader;
      $scope.submit = function() {
        if (uploader.queue.length > 0) {
          uploader.uploadAll();
        } else {
          doSendPost(buildReqData());
        }
      };
      function buildReqData(uploadedImages) {
        var images = uploadedImages ? $scope.event.images.concat(uploadedImages) : $scope.event.images;
        var reqData = _.extend($scope.event, {
          images: images
        });
        console.log('Request data ', reqData);
        return reqData;
      }
      function doSendPost(requestData) {
        $http.post('/event/save', requestData).success(function(res){
          console.log('Event is updated successfully ', res);
          var redirectUrl = '/event/' + res.event._id;
          console.log('Redirecting to ', redirectUrl);
          $window.location = redirectUrl;
        }).error(function(err) {
          console.error('Failed to create event ', err);
        });
        }
  }]);
