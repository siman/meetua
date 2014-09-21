'use strict';

angular.module('myApp').controller('MyEventsCtrl',
  ['$scope', '$http', '$q', 'util', 'EVENT_LIMIT', 'EventsResource',
  function ($scope, $http, $q, util, EVENT_LIMIT, EventsResource) {
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
        var now = Date.now();
        var userId = $scope.currentUser._id;
        var reqs = {
          my: EventsResource.query({authorId: userId}).$promise,
          myCanceled: EventsResource.query({authorId: userId, canceled: true}).$promise,
          going: EventsResource.query({participantId: userId, passed: false}).$promise,
          // TODO: Check also end date that it is <= now. issue #171
          visited: EventsResource.query({participantId: userId, passed: true}).$promise
        };
        $q.all(reqs).then(function(res) {
          $scope.events = res;
        });
      }
    }

    init();
  }]);
