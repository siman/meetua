'use strict';

angular.module('myApp').controller('ViewEventCtrl',
  ['$rootScope', '$scope', '$http', 'util', 'EventsResource', '$alert',
  function ($rootScope, $scope, $http, util, EventsResource, $alert) {
    setCurrentEvent(_myInit.event);
    console.log("Event", $scope.event);

    function setCurrentEvent(event) {
      pickoutFriends(event);
      calculateDuration(event);
      $scope.event = event;
    }

    function pickoutFriends(event) {
      if ($scope.currentUser) {
        var friendsAndOthers = _.partition(event.participants, function(participant) {
          return _.find($scope.currentUser.profile.friends, function(friend) {
            return friend._id === participant.user._id;
          });
        });
        event.friendParticipants = friendsAndOthers[0];
        event.otherParticipants = friendsAndOthers[1];
      } else {
        // If current user is a guest then all participants are not friends.
        event.otherParticipants = event.participants;
      }
      return event;
    }

    function calculateDuration(event) {
      if (event.end) {
        var e = moment(event.end.dateTime);
        var s = moment(event.start.dateTime);
        var d = moment.duration({
          years: s.years() - e.years(),
          months: s.months() - e.months(),
          days: s.days() - e.days(),
          hours: s.hours() - e.hours(),
          minutes: s.minutes() - e.minutes()
        });
        event.duration = d.humanize();
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

    $scope.cancelEvent = function() {
      console.log('cancelEvent');
      new EventsResource($scope.event).$cancel().then(function(res) {
        $alert({content: res.msg});
        $scope.event = res.event;
      }, $scope.app.ErrorService.handleResponse);
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
              setCurrentEvent(res.event);
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