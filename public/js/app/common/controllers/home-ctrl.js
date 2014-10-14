'use strict';

angular.module('myApp').controller('HomeCtrl',
  ['$scope', '$http', 'util', 'activities', 'ErrorService', '$alert', '$q', 'EventsService', 'EVENT_LIMIT', 'EventsResource',
  function ($scope, $http, util, activities, ErrorService, $alert, $q, EventsService, EVENT_LIMIT, EventsResource) {
    $scope.data = {};
    $scope.activities = ([{name: 'all', textOver: 'Все', selected: true}]).concat(activities);
    $scope.foundEvents = undefined; // []. undefined is for proper UI state on page load.

    $scope.$watch('currentUser', function(currentUser) {
      if (!currentUser) {
        return;
      }
      // load preferred activities, keep logic on the client, because it's not critical now and keeps our REST more generic
      var preferredActivities = currentUser.profile.preferredActivities;
      var fetchPrefEvents = _.map(preferredActivities, function(activity) {
        return EventsResource.query({activities: [activity], limit: EVENT_LIMIT}).$promise;
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


    $scope.activityByName = findActivityByName;

    function findActivityByName(actName) {
      return _.findWhere($scope.activities, {name: actName});
    }

    $scope.isSubscribedOnSelectedActivity = function() {
      return $scope.currentUser && _.contains($scope.currentUser.profile.preferredActivities, $scope.data.selectedActivity);
    };

    $scope.toggleSubscriptionOnSelectedActivity = function() {
      var selected = $scope.data.selectedActivity;
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

    $scope.$watch('data.selectedActivity', function(newAct) {
      if (newAct) {
        console.log("actName", newAct);
        findEvents([newAct]);
      }
    });

    $scope.toggleActivityFilter = function(activity) {
      var act = findActivityByName(activity.name);
      var selectedActs = _.where($scope.activities, {selected: true});
      if (act.name === 'all') {
        // Unselected other filter if user selected to show events of 'All' types.
        _.each(selectedActs, function(act) { act.selected = false; });
        act.selected = true;
        selectedActs = [];
      } else {
        act.selected = !act.selected;
        var allIsSelected = _.findWhere(selectedActs, {name: 'all'});
        if (allIsSelected) {
          allIsSelected.selected = false;
        }
        selectedActs = _.where($scope.activities, {selected: true});
      }
      // Select All events if nothing selected.
      if (selectedActs.length === 0) {
        var allAct = _.findWhere($scope.activities, {name: 'all'});
        allAct.selected = true;
      }
      var selectedActNames = _.map(selectedActs, function(act) { return act.name; });
      findEvents(selectedActNames);
    };

    function init() {
      findEvents();
      countEventsByActivity();
    }

    function countEventsByActivity() {
      $http.get(util.apiUrl('/events/countByActivity'), {}).
        success(function(data) {
          _.each(data, function(c) {
            var act = findActivityByName(c.activity);
            if (act) {
              act.eventCount = c.count;
            }
          });
        }).
        error(function(data) {
          console.log("countByActivity error", data)
        });
    }

    function findEvents(actNames) {
      var params = { limit: EVENT_LIMIT };
      if (actNames) {
        console.log('Filter events by activities: ', actNames);
        params.activities = actNames;
      }
      EventsResource.query(params, function(data) {
        $scope.foundEvents = data;
      });
    }

    init();
  }]);
