'use strict';

angular.module('myApp').controller('FirstTimeViewCtrl',
  ['$scope', 'EventService',
    function ($scope, EventService) {
      console.log("First time view event", $scope.event);

      function setEventAsViewed(event) {
        event.ux.isJustCreated = false;
        return event
      }

      function clearAuthorData(event) {
        event.author = event.author._id;
        return event
      }

      var ev = clearAuthorData(setEventAsViewed($scope.event));

      EventService.postSave(ev, false)

    }]);