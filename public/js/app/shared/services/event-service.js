'use strict';

(function(isNode, isAngular) {

  var SharedEventService = function() {
    /**
     * @param item removed image
     * @param images images left
     */
    this.maybeChangeLogo = function(item, images) {
      if (item.isLogo && images.length > 0) { // logo is removed
        images[0].isLogo = true; // make first image logo
      }
    }
  };

  if (isAngular) {
    angular.module('myApp.shared')
      .service('SharedEventService', SharedEventService);
  } else if (isNode) {
    module.exports = new SharedEventService();
  }

})(typeof module !== 'undefined' && module.exports,
    typeof angular !== 'undefined');