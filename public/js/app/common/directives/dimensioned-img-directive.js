'use strict';
/**
 * Created by oleksandr at 6/14/14 1:53 PM
 */
angular.module('myApp')
  .directive('dimensionedImg', ['util', '$parse',function(util, $parse) {
    function link($scope, element, attrs) {
      $scope.$watch('src', function(src) {
        console.log(src);
        var image = new Image();
        if (!src) {
          return;
        }
        image.src = src;
        image.onload = onLoad;

        element.removeAttr('src');
        element.removeAttr('width');
        element.removeAttr('height');

        function onLoad() {
          var dimensions = util.calculateImgDimensions(this, {width: attrs.width, height: attrs.height});
          element.css('width', dimensions.width);
          element.css('height', dimensions.height);
          element.attr('src', src); // show image when dimensions have been calculated
        }
      });
    }
    return {
      replace: true,
      template: '<img/>',
      scope: {
        src: '=ngSrc',
        width: '=',
        height: '='
      },
      restrict: 'E',
      link: link
    };
  }]);