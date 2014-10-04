'use strict';

angular.module('myApp').controller('HomeCtrl',
  ['$scope', '$http', 'util', 'activities', 'ErrorService', '$alert', '$q', 'EventsService', 'EVENT_LIMIT', 'EventsResource',
  function ($scope, $http, util, activities, ErrorService, $alert, $q, EventsService, EVENT_LIMIT, EventsResource) {
    $scope.data = {};
    $scope.activities = activities;
    $scope.foundEvents = undefined; // []. undefined is for proper UI state on page load.

    $scope.$watch('currentUser', function(currentUser) {
      if (!currentUser) {
        return;
      }
      // load preferred activities, keep logic on the client, because it's not critical now and keeps our REST more generic
      var preferredActivities = currentUser.profile.preferredActivities;
      var fetchPrefEvents = _.map(preferredActivities, function(activity) {
        return EventsResource.query({act: activity, limit: EVENT_LIMIT}).$promise;
      });
      $q.all(fetchPrefEvents).then(function(ress) {
        var events = _.flatten(_.map(ress, function(res) {return res}));
        var imgEvents = _.filter(events, function (event) { return event.images.length > 0; });
        $scope.subscription = {
          events: imgEvents,
          activities: preferredActivities
        };
      });
      EventsService.loadFriendsStream(currentUser).then(function(res) {
        $scope.friendsStream = res;
      }, function(err) { ErrorService.handleResponse(err); });
    });


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
      var params = { limit: EVENT_LIMIT };
      if (actName) {
        params.act = actName;
      }
      EventsResource.query(params, function(data) {
        $scope.foundEvents = data;
      });
    }

    init();
  }]);
