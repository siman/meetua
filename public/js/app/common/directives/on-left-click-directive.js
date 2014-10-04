/**
 * Created by oleksandr on 9/14/14.
 */
'use strict';

/**
 * on-left-click directive. Has exactly the same behaviour as ng-click has(actually just copied implementation),
 * but only works for mouse left button click. It's useful when you want for example ignore any other 'clicks',
 * like mouse wheel click.
 */
angular.module('myApp')
.directive('onLeftClick', ['$parse', function($parse) {
  function link($scope, element, attrs) {
    var fn = $parse(attrs['onLeftClick']);
    element.on('click', function(event) {
      if (event.which == 1 && !event.ctrlKey) { // only mouse left click
        $scope.$apply(function() {
          fn($scope, {$event: event});
        });
      }
    });
  }
  return {
    restrict: 'A',
    link: link
  };
}]);