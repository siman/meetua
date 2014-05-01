'use strict';

/**
 * Created by Alex on 5/1/14.
 */

angular.module('myApp')
  .factory('currentUserService', function() {
    var user = _myInit.currentUser;
    var isLoggedIn = !_.isUndefined(user);
    return {
      user: user,
      userId: isLoggedIn ? user._id : undefined,
      isLoggedIn: isLoggedIn
    }
  });
