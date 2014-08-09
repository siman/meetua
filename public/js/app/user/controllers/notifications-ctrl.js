'use strict';

angular.module('myApp').controller('NotificationsCtrl',
  ['$rootScope', '$scope', '$http', 'util', 'ErrorService',
  function ($rootScope, $scope, $http, util, ErrorService) {

    $scope.notifs = {
      enabled: undefined,
      email: undefined
    };

    function init() {
      if ($scope.currentUser) {
        suggestDefaults();
      }
    }

    function curUser() {
      return $scope.currentUser;
    }

    function isEmptyStr(str) {
      return !str || 0 === str.length || !str.trim();
    }

    // If no user experience with this feature
    function noUx() {
      return !curUser().ux.setupNotifications;
    }

    function suggestDefaults() {
      if (noUx) {
        $scope.notifs.enabled = 'true';
        $scope.notifs.email = suggestEmail();
      } else {
        $scope.notifs.enabled = curUser().emailNotifications.enabled.toString();
        $scope.notifs.email = curUser().emailNotifications.email;
      }
    }

    function suggestEmail() {
      var accEmail = curUser().email;
      var notifEmail = curUser().emailNotifications.email;
      var resEmail = '';
      if (!isEmptyStr(notifEmail)) {
        resEmail = notifEmail;
      } else if (!isEmptyStr(accEmail)) {
        resEmail = accEmail;
      }
      return resEmail;
    }

    // TODO: Use $modal as in [auth-modal.js]?
    var $notifsModal = $('#notifs_modal');

    $scope.$on('event:user-joined-event',  function(angEvent, data) {
      showModalIfNoUx();
    });

    function showModalIfNoUx() {
      if (noUx()) {
        console.log('showModalIfNoUx!!');
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