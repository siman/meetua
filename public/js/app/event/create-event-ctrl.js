'use strict';

angular.module('myApp')
  .controller('CreateEventCtrl', ['$scope', 'EventImageService', 'EventService', 'activities',
  function($scope, EventImageService, EventService, activities) {
    var imageService = $scope.imageService = EventImageService.create({
      scope: $scope,
      onAllUploaded: function submitAfterUpload(uploadedImages) {
        EventService.doSendPost(buildReqData(uploadedImages));
      }
    });
    var uploader = $scope.uploader = imageService.uploader;
    $scope.activities = activities;
    $scope.event = {};
    $scope.submit = function() {
      if (uploader.queue.length > 0) {
        uploader.uploadAll();
      } else {
        EventService.doSendPost(buildReqData());
      }
    };
    function buildReqData(uploadedImages) {
      var reqData = _.extend($scope.event, {
          images: uploadedImages
      });
      console.log('Request data ', reqData);
      return reqData;
    }
  }]);