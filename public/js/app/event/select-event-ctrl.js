'use strict';

angular.module('myApp').controller('SelectEventCtrl',
  ['$scope', '$http', 'KIEV_MAP', 'BASE_MAP', 'myApiService', 'activities',
  function ($scope, $http, KIEV_MAP, BASE_MAP, myApiService, activities) {
    $scope.data = {};
    $scope.activities = activities;
    $scope.foundEvents = [];

    // Zoom map on Kiev.
    $scope.map = _.extend(BASE_MAP, KIEV_MAP);

    $scope.mapEvents = [];

    $scope.onEventOver = function (event) {
      $scope.mapEvents = [event.place];
    };

    $scope.onEventOut = function (event) {
      $scope.mapEvents = _.map($scope.foundEvents, function (ev) {
        // TODO think: how to show event without lat & lng on home page ??
        return ev.place
      });
    };

    // TODO Copypaste: Extract to common utils.
    $scope.viewEvent = function (event) {
      window.location = "/event/" + event._id;
    };

    $scope.$watch('data.selectedAct', function(newAct) {
      console.log("actName", newAct);
      findEvents(newAct);
    });

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
