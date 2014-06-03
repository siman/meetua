/**
 * Created by oleksandr at 6/1/14 8:46 PM
 */
angular.module('myApp')
  /**
   * It holds only currentUser object, so it's available on any controller without injection.
   * Don't add any other objects to it, since we have to keep global objects as little as possible.
   */
  .controller('AppCtrl', ['$scope', function($scope) {
    $scope.currentUser = _myInit.currentUser;
    console.log("Current user", $scope.currentUser);
  }]);