'use strict';

angular.module('myApp').controller('ViewEventCtrl',
  ['$rootScope', '$scope', '$http', 'util',
  function ($rootScope, $scope, $http, util) {
    $scope.event = pickoutFriends(_myInit.event);

    console.log("Event", $scope.event);

    function pickoutFriends(event) {
      if ($scope.currentUser) {
        var friendsAndOthers = _.partition(event.participants, function(participant) {
          return _.find($scope.currentUser.profile.friends, function(friend) {
            return friend._id === participant.user._id;
          });
        });
        event.friendParticipants = friendsAndOthers[0];
        event.otherParticipants = friendsAndOthers[1];
      }
      return event;
    }

    $scope.isCurrentUserAnAuthor = function() {
      return $scope.app.UserService.isUserAuthorOfEvent($scope.currentUser, $scope.event);
    };

    $scope.showNotificationSettings = function() {
      $rootScope.$broadcast('event:show-notification-settings', {});
    };

    $scope.isPart = function() {
      if ($scope.currentUser) {
        var curUserId = $scope.currentUser._id;
        return _.find($scope.event.participants, function(participant) {
          return participant.user._id === curUserId;
        });
      } else {
        return false;
      }
    };

    $scope.participate = function(guestNumber) {
      var $partBtn = $('#partBtn');
      $partBtn.attr('disabled', 'disabled');

      var params = {eventId: $scope.event._id, act: $scope.isPart() ? 'remove' : 'add', guests: guestNumber};
      $http.post(util.apiUrl('/events/participation'), params).
        success(function(data, status, headers, config) {
          $partBtn.removeAttr('disabled');  // FIXME: to Siman: controller shouldn't modify DOM. It's directive's responsibility
          var joinedEvent = data.status === 'added';
          $http({method: 'GET', url: util.apiUrl('/events/findById'), params: {id: $scope.event._id}}).
            success(function(res) {
              $scope.event = pickoutFriends(res.event);
              if (joinedEvent) {
                $rootScope.$broadcast('event:user-joined-event', {event: $scope.event});
              }
            });
        }).
        error(function(data, status, headers, config) {
          $partBtn.removeAttr('disabled');
          var err = (data.error ? data.error : data);
          var msg = 'Не удалось принять участие.  ' + _.isObject(err) ? JSON.stringify(err) : err;
          console.error(msg, data);
          $scope.app.ErrorService.alert(msg);
        });
    };
  }]);