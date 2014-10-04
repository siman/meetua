'use strict';

angular.module('myApp')
  .directive('actIcon', function() {
    function link(scope, element, attrs, ngModel) {
      scope.onActClick = function() {
        var val = getVal();
        var newVal = undefined;
        if (scope.isSelected()) {
          newVal = scope.multiple ? _.without(val, scope.activity.name) : undefined;
        } else {
          if (scope.multiple) {
            val.push(scope.activity.name);
            newVal = val;
          } else {
            newVal = scope.activity.name;
          }
        }
        ngModel.$setViewValue(newVal);
      };
      scope.isSelected = function() {
        return scope.multiple ? _.contains(getVal(), scope.activity.name) : ngModel.$modelValue == scope.activity.name;
      };
      /**
       * @returns {string|Array}
       */
      function getVal() {
        return scope.multiple ? ngModel.$modelValue || [] : ngModel.$modelValue;
      }
    }

    return {
      restrict: 'E',
      replace: true,
      require: 'ngModel',
      scope: {
        activity: '=',
        ngModel: '=',
        multiple: '@'
      },
      link: link,
      templateUrl: '/tpl/act-icon-tpl'
    };
  });