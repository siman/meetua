/**
 * Created by oleksandr at 6/1/14 2:08 PM
 */
angular.module('myApp')
  /**
   *
   * @return {HttpPromise} promise. Resolves the promise on login success. Rejects the promise on modal close.
   */
  .factory('AuthModal', ['$modal', '$q', '$http', '$window', 'util', 'UserService', function($modal, $q, $http, $window, util, UserService) {
    var modal = $modal({
      title: 'Войти',
      html: true,
      template: '/tpl/empty-modal-tpl',
      contentTemplate: '/tpl/auth-tpl',
      show: false
    });
    var unwatch = null;

    function open() {
      var deferred = $q.defer();

      modal.show();
      modal.$scope.submit = function(auth) {
        handlePromise($http.post(util.apiUrl('/user/login'), auth));
      };

      modal.$scope.authenticateFb = function authenticateFb() {
        var child = $window.open('/auth/facebook', 'Войти', util.windowOpenOptions(800, 500));
        var timer = setInterval(checkChild, 500);

        function checkChild() {
          if (child.closed) {
            clearInterval(timer);
            handlePromise(UserService.getCurrentUser());
          }
        }
      };

      function handlePromise(promise) {
        promise.then(function(res) {
            var user = res.data.user;
            if (user) {
              modal.hide();
              modal.$scope.errors = [];
              deferred.resolve(user);
            } else {
              // no user when login fails
              // don't reject promise
              // reject only if the user closes the modal
            }
          }, function(res) {
            modal.$scope.errors = res.data;
          });
      }

      unwatch = modal.$scope.$watch('$isShown', function(isNowShown, wasShown) {
        var modalClosed = wasShown && !isNowShown;
        if (modalClosed) {
          deferred.reject();
        }
      });
      // TODO unwatch
      return deferred.promise;
    }

    return {
      open: open
    };
  }]);
