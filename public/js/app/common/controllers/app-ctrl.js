/**
 * Created by oleksandr at 6/1/14 8:46 PM
 */
angular.module('myApp')
  /**
   * It holds only currentUser object, so it's available on any controller without injection.
   * Don't add any other objects to it, since we have to keep global objects as little as possible.
   */
  .controller('AppCtrl', ['$scope', 'util', 'UserService', 'ErrorService', 'EventsService',
    function($scope, util, UserService, ErrorService, EventsService) {
    $scope.currentUser = _myInit.currentUser;
    $scope.app = {
      util: util,
      UserService: UserService,
      EventsService: EventsService,
      ErrorService: ErrorService
    };
    console.log("Current user", $scope.currentUser);
  }]);