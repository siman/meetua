'use strict';

/**
 * Created by Alex on 5/1/14.
 */

angular.module('myApp')
  .factory('myApiService', ['API_BASE_URL', function(API_BASE_URL) {
    function buildUrl(relativeUrl) {
      return API_BASE_URL + relativeUrl;
    }
    return {
      buildUrl: buildUrl
    };
  }]);