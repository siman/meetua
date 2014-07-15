/**
 * Created by oleksandr at 6/1/14 2:08 PM
 */
angular.module('myApp')
  /**
   * @return {HttpPromise} promise. Resolves the promise on login success. Rejects the promise on modal close.
   */
  .factory('AuthModal', ['$modal', '$q', '$http', '$window', 'util', 'UserService', '$rootScope', function($modal, $q, $http, $window, util, UserService, $rootScope) {
    var modal = $modal({
      title: 'Войти',
      html: true,
      template: '/tpl/empty-modal-tpl',
      contentTemplate: '/tpl/auth-tpl',
      show: false
    });
    var unwatch = null;
    var modalOpened = false;

    var deferred; // can be called outside of function open(), e.g. from authenticateFb();
    function open() {
      deferred = $q.defer();

      modal.show();
      modalOpened = true;
      $rootScope.$broadcast('event:auth-modal-opened', {});

      modal.$scope.submit = function(auth) {
        handlePromise($http.post(util.apiUrl('/user/login'), auth));
      };

      modal.$scope.authenticateFb = authenticateFb;
      modal.$scope.authenticateVk = authenticateVk;

      unwatch = modal.$scope.$watch('$isShown', function(isNowShown, wasShown) {
        var modalClosed = wasShown && !isNowShown;
        if (modalClosed) {
          modalOpened = false;
          $rootScope.$broadcast('event:auth-modal-closed', {});
          deferred.reject();
        }
      });
      modal.$scope.$on('$destroy', function() {
        unwatch();
      });
      return deferred.promise;
    }

    function authenticateFb() {
      authenticate('/auth/facebook');
    }

    function authenticateVk() {
      authenticate('/auth/vkontakte');
    }

    function authenticate(authUrl) {
      if (!modalOpened) {
        openModal(function() {
          authenticate(authUrl);
        });
      }
      var child = $window.open(authUrl, 'Войти', util.windowOpenOptions(800, 500));
      var timer = setInterval(checkChild, 500);

      function checkChild() {
        if (child.closed) {
          clearInterval(timer);
          handlePromise(UserService.getCurrentUser());
        }
      }
    }

    function handlePromise(promise) {
      promise.then(function(res) {
        var user = res.data.user;
        if (user) {
          modal.hide();
          modalOpened = false;
          modal.$scope.errors = [];
          deferred.resolve(user);
          $rootScope.$broadcast('event:auth-modal-closed', {}); // broadcast after user resolved
        } else {
          // no user when login fails
          // don't reject promise
          // reject only if the user closes the modal
        }
      }, function(res) {
        modal.$scope.errors = res.data;
      });
    }

    function openModal(cb) {
      $http.get(util.apiUrl('/user/login')).success(function(resp) {
        console.log('successfully logged in');
      });
      var deregister = $rootScope.$on('event:auth-modal-opened', function() {
        cb();
        deregister();
      });
    }

    return {
      open: open,
      authenticateVk: authenticateVk,
      authenticateFb: authenticateFb
    };
  }]);
