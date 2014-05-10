'use strict';

angular.module('myApp')
  .directive('actIcon', function() {
    function link(scope, element, attrs, ngModel) {
      scope.onActClick = function() {
        if (scope.activity === ngModel.$modelValue) {
          ngModel.$setViewValue(undefined);
        } else {
          ngModel.$setViewValue(scope.activity);
        }
      };
    }

    return {
      restrict: 'E',
      replace: true,
      require: 'ngModel',
      scope: {
        activity: '@',
        textOver: '@',
        ngModel: '='
      },
      link: link,
      templateUrl: '/tpl/act-icon-tpl'
    };
  });