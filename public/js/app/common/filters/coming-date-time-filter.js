'use strict';

angular.module('myApp')
.filter('comingDateTime', function() {
    return function(date) {
      if (date) {
        var d = moment(date);
        var isAfterWeek = d.isAfter(moment().add(1, 'week'));
        return d.calendar() + (isAfterWeek ? ', ' + d.format('hh:mm') : '');
      } else {
        console.warn('comingDate arg is undefined');
      }
    }
  });