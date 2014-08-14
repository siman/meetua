'use strict';

angular.module('myApp').controller('ViewEventCtrl',
  ['$rootScope', '$scope', '$http', 'util', 'ErrorService',
  function ($rootScope, $scope, $http, util, ErrorService) {
    var event = _myInit.event;
    console.log("Event", event);

    $scope.event = event;

    function init() {
      var isPart = isCurrentUserTakingPartInEvent();
      changeParticipation(isPart);
    }

    $scope.showNotificationSettings = function() {
      $rootScope.$broadcast('event:show-notification-settings', {});
    };

    function isCurrentUserTakingPartInEvent() {
      if ($scope.currentUser) {
        var curUserId = $scope.currentUser._id;
        return _.find(event.participants, function(participant) {
          return participant.user._id === curUserId;
        });
      } else {
        return false;
      }
    }

    function changeParticipation(isPart) {
      $scope.isPart = isPart;
    }

    $scope.participate = function(guestNumber) {
      var $partBtn = $('#partBtn');
      $partBtn.attr('disabled', 'disabled');

      var params = {eventId: event._id, act: $scope.isPart ? 'remove' : 'add', guests: guestNumber};
      $http({method: 'POST', url: util.apiUrl('/events/participation'), params: params}).
        success(function(data, status, headers, config) {
          $partBtn.removeAttr('disabled');  // FIXME: to Siman: controller shouldn't modify DOM. It's directive's responsibility
          var joinedEvent = data.status === 'added';
          changeParticipation(joinedEvent);
          $http({method: 'GET', url: util.apiUrl('/events/findById'), params: {id: $scope.event._id}}).
            success(function(res) {
              $scope.event = res.event;
              if (joinedEvent) {
                $rootScope.$broadcast('event:user-joined-event', {event: $scope.event});
              }
            });
        }).
        error(function(data, status, headers, config) {
          $partBtn.removeAttr('disabled');
          changeParticipation(false);
          var err = (data.error ? data.error : data);
          var msg = 'Не удалось принять участие.  ' + _.isObject(err) ? JSON.stringify(err) : err;
          console.error(msg, data);
          ErrorService.alert(msg);
        });
    };

    init();
  }]);