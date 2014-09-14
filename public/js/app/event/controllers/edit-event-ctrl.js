'use strict';

angular.module('myApp')
  .controller('EditEventCtrl', ['$scope', 'activities', 'EventImageService', 'EventsResource', 'WYSIWYG_OPTIONS',
    'ErrorService', '$window',
  function($scope, activities, EventImageService, EventsResource, WYSIWYG_OPTIONS, ErrorService, $window) {
    $scope.event = _myInit.event;
    $scope.WYSIWYG_OPTIONS = WYSIWYG_OPTIONS;
    $scope.event.images = $scope.event.images || [];
    $scope.activities = activities;
    var imageService = $scope.imageService = EventImageService.create({
      scope: $scope,
      onAllUploaded: function submitAfterUpload(uploadedImages) {
        postSave(buildReqData(uploadedImages));
      },
      event: $scope.event
    });
    var uploader = $scope.uploader = imageService.uploader;
    $scope.submit = function() {
      if (uploader.getNotUploadedItems().length > 0) {
        uploader.uploadAll();
      } else {
        postSave(buildReqData());
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
    function postSave(requestData) {
      new EventsResource(requestData).$save().then(function(res) {
        $window.location = res.event.url;
      }, ErrorService.handleResponse);
    }
  }]);
