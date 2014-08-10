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
      suggestDefaults();
    }

    function isEmptyStr(str) {
      return !str || 0 === str.length || !str.trim();
    }

    // If user has no experience with this feature.
    function hasNoUx() {
      return !$scope.currentUser.ux.setupNotifications;
    }

    function suggestDefaults() {
      if ($scope.currentUser && !defaultsSuggested) {
        if (hasNoUx()) {
          $scope.notifs.enabled = 'true';
          $scope.notifs.email = suggestEmail();
        } else {
          $scope.notifs.enabled = $scope.currentUser.emailNotifications.enabled.toString();
          $scope.notifs.email = $scope.currentUser.emailNotifications.email;
        }
        defaultsSuggested = true;
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

    $scope.$on('event:user-joined-event', function(angEvent, data) {
      showModalIfNoUx();
    });

    // TODO: Use $modal as in [auth-modal.js]?
    var $notifsModal = $('#notifs_modal');

    function showModalIfNoUx() {
      suggestDefaults();
      if ($scope.currentUser && hasNoUx()) {
        $notifsModal.modal('show');
      }
    }

    $scope.saveNotifications = function() {
      console.log('email', $scope.notifs.email);

      if ($scope.notifsForm.$valid) {
        $notifsModal.modal('hide');
        var enabled = $scope.notifs.enabled === 'true';
        var params = {
          enabled: enabled
        };
        if (enabled) {
          params.email = $scope.notifs.email;
        }
        $http({ method: 'POST', url: util.apiUrl('/user/notifications'), params: params }).
          success(function(data, status, headers, config) {
            console.log('OK: Notification settings saved');
          }).
          error(function(data, status, headers, config) {
            console.error("Failed to save notification settings", data);
            ErrorService.alert('Не удалось сохранить настройки уведомлений.' +
              ' Попробуйте настроить уведомления со страницы Вашего аккаунта.');
          });
      }
    };

    init();
  }]);