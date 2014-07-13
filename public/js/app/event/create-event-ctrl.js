'use strict';

angular.module('myApp')
  .controller('CreateEventCtrl', ['$rootScope', '$scope', 'EventImageService', 'EventService', 'activities', 'AuthModal',
  function($rootScope, $scope, EventImageService, EventService, activities, AuthModal) {
    var imageService = $scope.imageService = EventImageService.create({
      scope: $scope,
      onAllUploaded: function submitAfterUpload(uploadedImages) {
        EventService.postSave(buildReqData(uploadedImages));
      }
    });
    var uploader = $scope.uploader = imageService.uploader;
    $scope.activities = activities;
    $scope.event = {};
    $scope.submit = function() {
      if (uploader.queue.length > 0) {
        uploader.uploadAll();
      } else {
        EventService.postSave(buildReqData(), true/*redirect*/);
      }
    };
    $scope.authenticateFb = AuthModal.authenticateFb.bind(AuthModal);
    $scope.authenticateVk = AuthModal.authenticateVk.bind(AuthModal);

    function buildReqData(uploadedImages) {
      var reqData = _.extend({
        images: uploadedImages
      }, $scope.event);
      console.log('Request data ', reqData);
      return reqData;
    }
  }]);