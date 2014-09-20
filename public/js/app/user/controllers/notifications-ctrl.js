'use strict';

angular.module('myApp').controller('NotificationsCtrl',
  ['$rootScope', '$scope', '$http', 'util', 'ErrorService',
  function ($rootScope, $scope, $http, util, ErrorService) {

    var defaultsSuggested = false;

    $scope.notifs = {
      enabled: undefined,
      email: undefined
    };

    function init() {
      $scope.$on('event:show-notification-settings', function(angEvent, data) {
        showModal();
      });
    }

    // TODO: Use $modal as in [auth-modal.js]?
    var $notifsModal = $('#notifs_modal');

    function showModal() {
      console.log('NotificationsCtrl: showModal');
      if ($scope.currentUser) {
        suggestDefaults();
        $notifsModal.modal('show');
      }
    }

    function suggestDefaults() {
      if (!defaultsSuggested) {
        $scope.notifs.enabled = $scope.currentUser.emailNotifications.enabled.toString();
        $scope.notifs.email = suggestEmail();
        defaultsSuggested = true;
        console.log('NotificationsCtrl: defaults suggested');
      }
    }

    function suggestEmail() {
      var accEmail = $scope.currentUser.email;
      var notifEmail = $scope.currentUser.emailNotifications.email;
      var resEmail = '';
      if (!isEmptyStr(notifEmail)) {
        resEmail = notifEmail;
      } else if (!isEmptyStr(accEmail)) {
        resEmail = accEmail;
      }
      return resEmail;
    }

    function isEmptyStr(str) {
      return !str || 0 === str.length || !str.trim();
    }

    $scope.closeNotifications = function() {
      $notifsModal.modal('hide');
    };

    $scope.saveNotifications = function() {
      console.log('Chosen notification email:', $scope.notifs.email);
      if ($scope.notifsForm.$valid) {
        $notifsModal.modal('hide');
        var enabled = $scope.notifs.enabled === 'true';
        var params = {
          enabled: enabled
        };
        if (enabled) {
          params.email = $scope.notifs.email;
        }
        $http.post(util.apiUrl('/user/notifications'), params).
          success(function(data, status, headers, config) {
            console.log('OK: Notification settings saved');
            // We want to re-read current user because it's notification preferences were updated.
            $rootScope.$broadcast('event:reload-current-user', {});
          });
      }
    };

    init();
  }]);