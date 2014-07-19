'use strict';

angular.module('myApp')
  .controller('EditEventCtrl', ['$scope', 'activities', 'EventImageService', 'EventService', 'WYSIWYG_OPTIONS',
  function($scope, activities, EventImageService, EventService, WYSIWYG_OPTIONS) {
    $scope.event = _myInit.event;
    $scope.WYSIWYG_OPTIONS = WYSIWYG_OPTIONS;
    $scope.event.images = $scope.event.images || [];
    $scope.activities = activities;
    var imageService = $scope.imageService = EventImageService.create({
      scope: $scope,
      onAllUploaded: function submitAfterUpload(uploadedImages) {
        EventService.postSave(buildReqData(uploadedImages));
      },
      event: $scope.event
    });
    var uploader = $scope.uploader = imageService.uploader;
    $scope.submit = function() {
      if (uploader.queue.length > 0) {
        uploader.uploadAll();
      } else {
        EventService.postSave(buildReqData());
      }
    };
    function buildReqData(uploadedImages) {
      uploadedImages = uploadedImages || [];
      var reqData = _.extend({}, $scope.event, {
        images: uploadedImages.concat($scope.event.images)
      });
      console.log('Request data ', reqData);
      return reqData;
    }
  }]);
