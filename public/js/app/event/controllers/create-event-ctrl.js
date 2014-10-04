'use strict';

angular.module('myApp')
  .controller('CreateEventCtrl', ['$rootScope', '$scope', 'EventImageService', 'EventsResource', 'activities',
    'WYSIWYG_OPTIONS', 'ErrorService', '$window',
  function($rootScope, $scope, EventImageService, EventsResource, activities, WYSIWYG_OPTIONS, ErrorService, $window) {
    var imageService = $scope.imageService = EventImageService.create({
      scope: $scope,
      onAllUploaded: function submitAfterUpload(uploadedImages) {
        postSave(buildReqData(uploadedImages));
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
        postSave(buildReqData());
      }
    };

    function buildReqData(uploadedImages) {
      var reqData = _.extend({
        images: uploadedImages
      }, $scope.event);
      console.log('Request data ', reqData);
      return reqData;
    }
    function postSave(requestData) {
      new EventsResource(requestData).$save().then(function(res) {
        $window.location = res.event.url;
      }, ErrorService.handleResponse);
    }
  }]);