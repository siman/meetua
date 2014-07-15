'use strict';
/**
 * Created by oleksandr at 7/6/14 6:51 PM
 */
angular.module('myApp')
  .service('UserService', ['$http', 'util', function($http, util) {
    this.getCurrentUser = getCurrentUser;

    /**
     * @returns {HttpPromise} current user
     */
    function getCurrentUser() {
      return $http.get(util.apiUrl('/user/getCurrent'));
    }
  }]);