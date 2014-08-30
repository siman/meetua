'use strict';

angular.module('myApp').controller('SelectEventCtrl',
  ['$scope', '$http', 'KIEV_MAP', 'BASE_MAP', 'util', 'activities', 'ErrorService', '$alert',
  function ($scope, $http, KIEV_MAP, BASE_MAP, util, activities, ErrorService, $alert) {
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

    $scope.activityByName = function(actName) {
      return _.findWhere(activities, {name: actName});
    };

    $scope.isSubscribedOnSelectedActivity = function() {
      return $scope.currentUser && _.contains($scope.currentUser.profile.preferredActivities, $scope.data.selectedAct);
    };

    $scope.toggleSubscriptionOnSelectedActivity = function() {
      var selected = $scope.data.selectedAct;
      var preferred = $scope.currentUser.profile.preferredActivities;
      var wasSubscribed = _.contains(preferred, selected);
      if (wasSubscribed) {
        preferred = _.without(preferred, selected);
      } else {
        preferred.push(selected);
      }
      $scope.currentUser.profile.preferredActivities = preferred;
      $http.post(util.apiUrl('/user/updateProfile'), $scope.currentUser).success(function(res) {
        var msg = wasSubscribed ? 'Вы отписаны от событий ' + selected : 'Вы подписаны на события ' + selected;
        $alert({content: msg});
      }).error(function(err) {
        ErrorService.handleResponse(err);
      });
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
      $http({method: 'GET', url: util.apiUrl('/events/find'), params: params}).
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
