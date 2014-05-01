'use strict';

angular.module('myApp').controller('SelectEventCtrl',
  ['$scope', '$http', 'KIEV_MAP', 'BASE_MAP', 'myApiService',
  function ($scope, $http, KIEV_MAP, BASE_MAP, myApiService) {
    $scope.selectedAct = undefined;

    $scope.foundEvents = [];

    // Zoom map on Kiev.
    $scope.map = _.extend(BASE_MAP, KIEV_MAP);

    $scope.mapEvents = [];

    $scope.onEventOver = function (event) {
      $scope.mapEvents = [event.place];
    };

    $scope.onEventOut = function (event) {
      $scope.mapEvents = _.map($scope.foundEvents, function (ev) {
        return ev.place
      });
    };

    // TODO Copypaste: Extract to common utils.
    $scope.viewEvent = function (event) {
      window.location = "/event/" + event._id;
    };

    $scope.onActClick = function (actName) {
      if (actName === $scope.selectedAct) {
        actName = undefined;
      }
      $scope.selectedAct = actName;
      console.log("actName", actName);
      findEvents(actName);
    };

    function init() {
      findEvents();
    }

    function findEvents(actName) {
      var params = _.isUndefined(actName) ? {} : {act: actName};
      $http({method: 'GET', url: myApiService.buildUrl('/events/find'), params: params}).
        success(function (data) {
          $scope.foundEvents = data;
          $scope.mapEvents = _.map(data, function (ev) {
            return ev.place
          });
          console.log('Selected events ', $scope.foundEvents);
        }).
        error(function (data) {
          console.error('Failed to find events by ' + actName, data);
        });
    }

    init();
  }]);
