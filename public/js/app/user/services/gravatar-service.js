'use strict';
/**
 * Created by oleksandr at 6/9/14 3:32 PM
 */
angular.module('myApp')
  .factory('GravatarService', [function() {
    /**
     * @param {Object} user
     * @param {Number} [size]
     * @returns {string}
     */
    function gravatarLink(user, size) {
      size = size || 200;
      var defaults = 'retro';

      if (!user.email) {
        return 'https://gravatar.com/avatar/?s=' + size + '&d=' + defaults;
      }

      var hash = md5(user.email);
      return 'https://gravatar.com/avatar/' + hash + '?s=' + size + '&d=' + defaults;

    }

    return {
      gravatarLink: gravatarLink
    }
  }]);