/**
 * Created by oleksandr at 6/1/14 1:47 PM
 */
angular.module('myApp')
  .directive('angAuth', [function() {
    function link($scope) {
      $scope.$on('event:auth-loginRequired', function() {
        console.log('loginRequired');
        // TODO
      });
      $scope.$on('event:auth-loginConfirmed', function() {
        console.log('loginConfirmed');
        // TODO
      });
    }
    return {
      restrict: 'A',
      link: link
    };
}]);