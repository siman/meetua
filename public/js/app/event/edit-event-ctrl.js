'use strict';

angular.module('myApp')
  .controller('EditEventCtrl', ['$scope', 'activities', 'EventImageService', 'EventService',
  function($scope, activities, EventImageService, EventService) {
    $scope.event = _myInit.event;
    $scope.activities = activities;
    var imageService = $scope.imageService = EventImageService.create({
      scope: $scope,
      onAllUploaded: function submitAfterUpload(uploadedImages) {
        EventService.doSendPost(buildReqData(uploadedImages));
      },
      uploadedImages: $scope.event.images,
      event: $scope.event
    });
    var uploader = $scope.uploader = imageService.uploader;
    $scope.submit = function() {
      if (uploader.queue.length > 0) {
        uploader.uploadAll();
      } else {
        EventService.doSendPost(buildReqData());
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
  }]);
