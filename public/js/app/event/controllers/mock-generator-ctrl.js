'use strict';

angular.module('myApp').controller('MockGeneratorCtrl',
  ['$rootScope', '$scope', '$http', 'util', 'ErrorService',
  function($rootScope, $scope, $http, util, ErrorService) {

    $scope.gen = {
      eventCount: 1,
      isRandom: true,

      activities: 'TODO', // [] TODO Get from consts.

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

    $scope.generateEvents = function() {
      console.log('Generating ' + $scope.gen.eventCount + ' events...');
      console.log('UI state:\n', $scope.gen);
      $http.post('/dev/generate', $scope.gen).
        success(function(data, status, headers, config) {
          $scope.generatedEvents = data;
        }).
        error(function(data, status, headers, config) {
          // TODO Notify
        });
    };

    init();
  }]);