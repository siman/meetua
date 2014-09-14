'use strict';

/**
 * Created by oleksandr at 6/9/14 3:32 PM
 * See https://en.gravatar.com/site/implement/images/
 */

angular.module('myApp')
  .factory('GravatarService', ['md5', function(md5) {
    /**
     * @param {Object} user
     * @param {Number} [size]
     * @returns {string}
     */
    function gravatarLink(user, size) {
      size = size || 200;
      var defaults = 'monsterid';

      if (!user.email) {
        return 'https://gravatar.com/avatar/?s=' + size + '&d=' + defaults;
      }

      var hash = md5.createHash(user.email);
      return 'https://gravatar.com/avatar/' + hash + '?s=' + size + '&d=' + defaults;

    }

    return {
      gravatarLink: gravatarLink
    }
  }]);