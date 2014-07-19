'use strict';

angular.module('myApp')
  .controller('CreateEventCtrl', ['$rootScope', '$scope', 'EventImageService', 'EventService', 'activities', 'WYSIWYG_OPTIONS',
  function($rootScope, $scope, EventImageService, EventService, activities, WYSIWYG_OPTIONS) {
    var imageService = $scope.imageService = EventImageService.create({
      scope: $scope,
      onAllUploaded: function submitAfterUpload(uploadedImages) {
        EventService.postSave(buildReqData(uploadedImages));
      }
    });
    var uploader = $scope.uploader = imageService.uploader;
    $scope.WYSIWYG_OPTIONS = WYSIWYG_OPTIONS;
    $scope.activities = activities;
    $scope.event = {};
    $scope.submit = function() {
      if (uploader.queue.length > 0) {
        uploader.uploadAll();
      } else {
        EventService.postSave(buildReqData(), true/*redirect*/);
      }
    };

    function buildReqData(uploadedImages) {
      var reqData = _.extend({
        images: uploadedImages
      }, $scope.event);
      console.log('Request data ', reqData);
      return reqData;
    }
  }]);