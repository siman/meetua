'use strict';

angular.module('myApp').controller('MockGeneratorCtrl',
  ['$rootScope', '$scope', '$http', 'util', 'ErrorService',
  function($rootScope, $scope, $http, util, ErrorService) {

    $scope.gen = {
      eventCount: 1,
      activities: 'TODO', // []

      titleSizes: {
        small: false,
        medium: true,
        large: false
      },
      descSizes: {
        small: false,
        medium: true,
        large: false
      },
      hasHtmlDesc: true,

      hasLogo: true,
      logoSizes: {
        small: false,
        medium: true,
        large: false
      },

      dateTypes: {
        past: false,    // Ended in past.
        current: false, // Is currently happening: started before now and will be ended in future.
        future: true    // Will be started in future.
      },
      startDate: undefined,
      startTime: undefined,
      endDate: undefined,
      endTime: undefined,
      durationAmount: 2,
      durationUnit: 'h', // h | d

      isCanceled: false,
      isAuthor: false,
      participantCount: 0
    };

    function init() {
      // Nothing yet
    }

    function sizesToArray(sizeable) {
      var sizes = [];
      if (sizeable.small) sizes.push('small');
      if (sizeable.medium) sizes.push('medium');
      if (sizeable.large) sizes.push('large');
      return sizes;
    }

    function buildGenParams() {
      var params = {
        eventCount: $scope.gen.eventCount,
        titleSizes: sizesToArray($scope.gen.titleSizes),
        descSizes: sizesToArray($scope.gen.descSizes)
      };
      return params;
    }

    $scope.generateEvents = function() {
      console.log('Generating ' + $scope.gen.eventCount + ' events...');
      console.log('UI state:\n', $scope.gen);
      var genParams = buildGenParams();
      console.log('Generation params:\n', genParams);
      $http({method: 'POST', url: '/dev/generate', params: genParams}).
        success(function(data, status, headers, config) {
          // TODO Notify
        }).
        error(function(data, status, headers, config) {
          // TODO Notify
        });
    };

    init();
  }]);