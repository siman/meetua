'use strict';

/**
 * Created by oleksandr at 6/1/14 1:47 PM
 */
angular.module('myApp').directive('auth',
  ['AuthModal', 'AuthInterceptorService', 'UserService',
  function(AuthModal, AuthInterceptorService, UserService) {
    function link($scope) {

      $scope.$on('event:reload-current-user', function(angEvent, data) {
        UserService.getCurrentUser().then(
          function(res) {
            $scope.currentUser = res.data.user;
          },
          function(res) {
            modal.$scope.errors = res.data;
          }
      )});

      $scope.$on('event:auth-loginRequired', function(event, rejection) {
        // directive is great place to call modal, since directive is bound to element in the DOM
        // and can even e.g. pass to the modal an element to stick with.
        AuthModal.open().then(function(user) {
          $scope.currentUser = user; // save as application-wide object
          AuthInterceptorService.loginConfirmed();
        }, function() {
          AuthInterceptorService.loginCancelled(null/*data for event broadcast*/, rejection);
        });
      });
    }
    return {
      restrict: 'A',
      link: link
    };
}]);