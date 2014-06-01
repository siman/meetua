/**
 * Created by oleksandr at 6/1/14 2:08 PM
 */
angular.module('myApp')
  /**
   *
   * @return promise. Resolves the promise on login success. Rejects the promise on modal close.
   */
  .factory('AuthModal', ['$modal', '$q', '$http', 'API_BASE_URL', function($modal, $q, $http, API_BASE_URL) {
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
        $http.post(API_BASE_URL + '/user/login', auth).then(function(res) {
          modal.hide();
          modal.$scope.errors = [];
          deferred.resolve(res.data.user);
        }, function(res) {
          modal.$scope.errors = res.data;
        });
      };

      unwatch = modal.$scope.$watch('$isShown', function(isNowShown, wasShown) {
        if (wasShown && !isNowShown) {
          deferred.reject();
        }
      });
      return deferred.promise;
    }

    return {
      open: open
    };
  }]);
