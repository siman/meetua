'use strict';

angular.module('myApp').controller('ViewEventCtrl',
  ['$scope', '$http', 'BASE_MAP', 'currentUserService', 'myApiService', 'ErrorService',
  function ($scope, $http, BASE_MAP, currentUserService, myApiService, ErrorService) {
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
      $scope.isPart = isPart;
    }

    $scope.participate = function() {
      var $partBtn = $('#partBtn');
      $partBtn.attr('disabled', 'disabled');

      var params = {eventId: event._id, act: $scope.isPart ? 'remove' : 'add'};
      $http({method: 'POST', url: myApiService.buildUrl('/events/participation'), params: params}).
        success(function(data, status, headers, config) {
          $partBtn.removeAttr('disabled');  // FIXME: to Siman: controller shouldn't modify DOM. It's directive's responsibility
          changeParticipation(data.status === 'added');
          $http({method: 'GET', url: myApiService.buildUrl('/events/findById'), params: {id: $scope.event._id}}).
            success(function(res) {
              $scope.event = res.event;
            });
        }).
        error(function(data, status, headers, config) {
          $partBtn.removeAttr('disabled');
          changeParticipation(false);
          var msg = 'Не удалось принять участие.  ' + (data.error ? data.error : data);
          console.error(msg, data);
          ErrorService.alert(msg);
        });
    };

    init();
  }]);