'use strict';

angular.module('myApp')
  .directive('actIcon', function() {
    function link(scope, element, attrs, ngModel) {
      scope.onActClick = function() {
        if (scope.activity.name === ngModel.$modelValue) {
          ngModel.$setViewValue(undefined);
        } else {
          ngModel.$setViewValue(scope.activity.name);
        }
      };
    }

    return {
      restrict: 'E',
      replace: true,
      require: 'ngModel',
      scope: {
        activity: '=',
        ngModel: '='
      },
      link: link,
      templateUrl: '/tpl/act-icon-tpl'
    };
  });