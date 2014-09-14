'use strict';

angular.module('myApp').controller('MyEventsCtrl',
  ['$scope', '$http', 'util', 'EVENT_LIMIT',
  function ($scope, $http, util, EVENT_LIMIT) {
    $scope.events = {
      my: [],
      visited: [],
      going: [],
      myCanceled: []
    };

    function init() {
      findMyEvents();
    }

    // TODO Copypaste: Extract to common utils.
    $scope.viewEvent = function (event) {
      window.location = "/event/" + event._id;
    };

    function findMyEvents() {
      $http({method: 'GET', url: util.apiUrl('/events/myOverview'), params: {limit: EVENT_LIMIT}}).
        success(function (data) {
          $scope.events = data;
          console.log('Found my events', data);
        }).
        error(function (data) {
          console.error('Failed to find my events', data);
        });
    }

    init();
  }]);
