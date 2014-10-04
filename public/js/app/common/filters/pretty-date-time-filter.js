'use strict';

angular.module('myApp')
.filter('prettyDateTime', function() {
  return function(date) {
    if (date) {
      return moment(date).format('YYYY MMMM DD HH:mm');
    } else {
      console.warn('prettyDateTime arg is undefined');
    }
  };
});