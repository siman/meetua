'use strict';

angular.module('myApp').controller('UserGeneratorCtrl',
  ['$rootScope', '$scope', '$http', '$alert', 'util', 'ErrorService',
  function($rootScope, $scope, $http, $alert, util, ErrorService) {

    // Generated users returned from server.
    $scope.generatedUsers = undefined; // []

    // This structure will be sent to server controller.
    $scope.gen = {
      userCount: 1,
      isRandom: true
    };

    function init() {
      // Nothing yet
    }

    function getPreparedParams() {
      var genParams = _.extend({}, $scope.gen);
      return genParams;
    }

    $scope.generateUsers = function() {
      console.log('Generating ' + $scope.gen.userCount + ' users...');
      // Reset UI state.
      $scope.generatedUsers = undefined;

      var genParams = getPreparedParams();
      console.log('Generator params:\n', genParams);

      $http.post('/dev/user-generator', genParams).
        success(function(data, status, headers, config) {
          $scope.generatedUsers = data;
          $alert({content: '' + data.length + ' users have been generated'});
        }).
        error(function(data, status, headers, config) {
          ErrorService.handleResponse(data);
        });
    };

    init();
  }]);