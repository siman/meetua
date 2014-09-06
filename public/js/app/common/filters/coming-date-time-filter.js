'use strict';

angular.module('myApp')
.filter('comingDateTime', function() {
    return function(date) {
      if (date) {
        return moment(date).calendar();
      } else {
        console.warn('comingDate arg is undefined');
      }
    }
  });