'use strict';

angular.module('myApp')
  .controller('ViewEventCtrl', ['$scope', '$http', 'BASE_MAP', 'currentUserService',
    function ($scope, $http, BASE_MAP, currentUserService) {
      var event = _myInit.event;
      console.log("Event", event);

      $scope.event = event;

      $scope.map = _.extend(BASE_MAP, {
        center: {
          latitude: event.place.latitude,
          longitude: event.place.longitude
        },
        zoom: 16
      });

      function init() {
        var curUserId = currentUserService.userId;
        var isPart = _.find(event.participants, function(partId) {
          return partId === curUserId;
        });
        changeParticipation(isPart);
      }

      function changeParticipation(isPart) {
        if (isPart) {
          $scope.isPart = true;
          $scope.partBtnName = 'Отказаться от участия?';
        } else {
          $scope.isPart = false;
          $scope.partBtnName = 'Принять участие';
        }
      }

      $scope.participate = function() {
        var $partBtn = $('#partBtn');
        $partBtn.attr('disabled', 'disabled');

        var params = {eventId: event._id, act: $scope.isPart ? 'remove' : 'add'};
        $http({method: 'POST', url: '/api/meetua/events/participation', params: params}).
          success(function(data, status, headers, config) {
            $partBtn.removeAttr('disabled');
            changeParticipation(data.status === 'added');
          }).
          error(function(data, status, headers, config) {
            // TODO show on UI that failed to participate in event.
            $partBtn.removeAttr('disabled');
            changeParticipation(false);
            console.error('Failed to change participation in event', data);
          });
      };

      init();
    }]);