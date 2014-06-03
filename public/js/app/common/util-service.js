/**
 * Created by oleksandr at 6/1/14 2:31 PM
 */
angular.module('myApp')
  .factory('util',
  ['$q', '$templateCache', '$http', 'API_BASE_URL',
  function($q, $templateCache, $http, API_BASE_URL) {

    function fetchTpl(tpl) {
      return $q.when($templateCache.get(tpl) || $http.get(tpl)).then(function (res) {
        if (angular.isObject(res)) {
          $templateCache.put(tpl, res.data);
          return res.data;
        }
        return res;
      });
    }

    function apiUrl(relativeUrl) {
      return API_BASE_URL + relativeUrl;
    }

    return {
      fetchTpl: fetchTpl,
      apiUrl: apiUrl
    }
  }]);
