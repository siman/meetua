'use strict';
/**
 * Created by oleksandr at 7/6/14 6:51 PM
 */
angular.module('myApp')
  .service('UserService', ['$http', 'util', function($http, util) {
    this.getCurrentUser = getCurrentUser;
    this.isUserAuthorOfEvent = isUserAuthorOfEvent;

    /**
     * @returns {HttpPromise} current user
     */
    function getCurrentUser() {
      return $http.get(util.apiUrl('/user/getCurrent'));
    }

    /**
     * @param {User} user
     * @param {Event} event
     * @returns {Boolean}
     */
    function isUserAuthorOfEvent(user, event) {
      // user may be unavailable (e.g. currentUser)
      var authorId = event.author && event.author._id || event.author; // may be populated or not
      return user && authorId == user._id;
    }
  }]);