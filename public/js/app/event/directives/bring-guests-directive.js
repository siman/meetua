'use strict';

angular.module('myApp')
  .directive('bringGuests', function() {
    return {
      restrict: 'A',
      replace: true,
      template: function(tElement, tAttrs) {
        var res = "";
        for (var i = 0; i <= tAttrs.maxGuests; i++) {
          var txt = (i == 0 ? "Только я" : "+" + i);
          res = res + "<button type='button' data-dismiss='modal' ng-click='bringGuests("+i+")" +
            "' class='btn btn-default'>" + txt + "</button>"
        }
        return '<span>' + res + '</span>';
      }
    };

  });