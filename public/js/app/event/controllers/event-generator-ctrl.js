'use strict';

angular.module('myApp').controller('EventGeneratorCtrl',
  ['$rootScope', '$scope', '$http', '$alert', 'util', 'ErrorService',
  function($rootScope, $scope, $http, $alert, util, ErrorService) {

    // Generated events returned from server.
    $scope.generatedEvents = undefined; // []

    // UI specific structures.
    $scope.ui = {
      activities: {
        sport: true,
        conference: true
      }
    };

    // This structure will be sent to server controller.
    $scope.gen = {
      eventCount: 1,
      isRandom: true,

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

    function getPreparedParams() {
      var genParams = _.extend({}, $scope.gen);
      var ui = $scope.ui;
      var allActNames = _.keys(ui.activities);
      genParams.activities = _.filter(allActNames, function(act) {
        return ui.activities[act] == true;
      });
      return genParams;
    }

    $scope.generateEvents = function() {
      console.log('Generating ' + $scope.gen.eventCount + ' events...');
      // Reset UI state.
      $scope.generatedEvents = undefined;

      var genParams = getPreparedParams();
      console.log('Generator params:\n', genParams);

      $http.post('/dev/event-generator', genParams).
        success(function(data, status, headers, config) {
          $scope.generatedEvents = data;
          $alert({content: '' + data.length + ' events have been generated'});
        }).
        error(function(data, status, headers, config) {
          ErrorService.handleResponse(data);
        });
    };

    init();
  }]);