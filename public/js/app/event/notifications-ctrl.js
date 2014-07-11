'use strict';

angular.module('myApp').controller('NotificationsCtrl',
  ['$scope', '$http', 'BASE_MAP', 'util', 'ErrorService',
  function ($scope, $http, BASE_MAP, util, ErrorService) {

    $scope.receive = 'true';
    $scope.email = $scope.currentUser.email;

//    $scope.$watch("receive", function(receive) {
//      console.log('receive', receive);
////      console.log('receiveNotifs', typeof newReceiveNotifs);
//    });

    $scope.saveNotifs = function() {
      $('#notifs_modal').modal('hide');
      $http({method: 'POST', url: util.apiUrl('/events/notifications'), params: {email: $scope.email}}).
        success(function(data, status, headers, config) {
          $http({method: 'POST', url: myApiService.buildUrl('/events/notify'), params: {eventId: event._id}}).
            success(function(data, status, headers, config) {
              // TODO: Send notif about participation in event in callback from view-event-ctrl.
            }).
            error(function(data, status, headers, config) {
              console.error("Failed to send user a notification on participation", data);
            });
        }).
        error(function(data, status, headers, config) {
          console.error("Failed to save notification settings", data);
        });
    }
  }]);