'use strict';

angular.module('myApp')
//  .directive('timePicker', function() {})
  .directive('timePicker', function() {
    var controller = ['$scope', function($scope) {

      var minsStep = Number.parseInt($scope.minsStep);
      $scope.tp = {
        hourOptions: generateTimes(0, 1, 24),
        minOptions: generateTimes(0, minsStep, 60)
      };
//
////      $scope.validations = {
////        hours: undefined,
////        mins: undefined
////      };
//
//      // TODO: Write nice validation in Angular way!
////      $scope.$watch('hoursModel', function(newValue, oldValue) {
////        $scope.hoursModel.$invalid = $scope.hoursRequired == 'true' && (newValue < 0 || newValue > 23);
////      });
////
////      $scope.$watch('minsModel', function(newValue, oldValue) {
////        $scope.minsModel.$invalid = $scope.minsRequired == 'true' && (newValue < 0 || newValue > 59);
////      });
    }];

    function generateTimes(first, step, maxExclusive) {
      var timeArr = [];
      for (var i = first; i < maxExclusive; i += step) {
        var text = i < 10 ? '0' + i : i;
        timeArr.push({amount: i, text: text});
      }
      return timeArr;
    }

    return {
      restrict: 'AE',
      required: 'ngModel',
      templateUrl: '/tpl/time-picker-tpl',
//      controller: controller,
//      compile: function(element, attrs) {
////        console.log('hoursModel', attrs.hoursModel);
//        if (_.isUndefined(attrs.disabled)) { attrs.disabled = 'false'; }
//        if (_.isUndefined(attrs.minsStep)) { attrs.minsStep = '5'; }
//      },
      link: function(scope, elem, attrs, ctrl) {
        console.log('hoursModel', attrs.hoursModel);
        scope.$watch(attrs.hoursModel, function(newValue, oldValue) {
          console.log('watch hours');
//          ctrl.$setValidity('hours', scope.hoursRequired == 'true' && (newValue < 0 || newValue > 23));
        });
//        scope.$watch(attrs.minsName, function(newValue, oldValue) {
//          ctrl.$setValidity('mins', $scope.minsRequired == 'true' && (newValue < 0 || newValue > 59));
//        });
      },
      scope: {
        disabled: '=',
        form: '=',
        hoursName: '@',
        hoursModel: '=',
        hoursRequired: '=',
        minsStep: '@',
        minsName: '@',
        minsModel: '=',
        minsRequired: '='
      }
    };
  });