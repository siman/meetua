'use strict';

angular.module('myApp').controller('MyEventsCtrl',
  ['$scope', '$http', '$q', 'util', 'EVENT_LIMIT', 'EventsService',
  function ($scope, $http, $q, util, EVENT_LIMIT, EventsService) {
    $scope.events = {
      my: [],
      visited: [],
      going: [],
      myCanceled: []
    };

    function init() {
      findMyEvents();
    }

    function findMyEvents() {
      if ($scope.currentUser) {
        EventsService.getEventsOverview($scope.currentUser._id, function(res) {
          $scope.events = res;
        });
      }
    }

    init();
  }]);
