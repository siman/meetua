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

    $scope.isValidEndTime = isValidTime($scope.endTime);
    $scope.isValidStartTime = isValidTime($scope.startTime);

    /**
     * @param {Number} timeObj.hours
     * @param {Number} timeObj.mins
     */
    function isValidTime(timeObj) {

    }

    $scope.submit = function() {
      if (uploader.queue.length > 0) {
        uploader.uploadAll();
      } else {
        postSave(buildReqData());
      }
    };

    // TODO: Use start/endTime for building start/end.dateTime

    // TODO do not append start/endTime to post event req.

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