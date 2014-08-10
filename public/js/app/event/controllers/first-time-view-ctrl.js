'use strict';

angular.module('myApp').controller('FirstTimeViewCtrl',
  ['$scope', 'EventService',
    function ($scope, EventService) {
      console.log("First time view event", $scope.event);

      function setEventAsViewed(event) {
        event.ux.isJustCreated = false;
        return event
      }
      EventService.postSave(setEventAsViewed($scope.event), false)

    }]);