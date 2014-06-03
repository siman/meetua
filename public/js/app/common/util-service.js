/**
 * Created by oleksandr at 6/1/14 2:31 PM
 */
angular.module('myApp')
  .factory('util', ['$q', '$templateCache', '$http', function($q, $templateCache, $http) {
    return {
      fetchTpl: function(tpl) {
        return $q.when($templateCache.get(tpl) || $http.get(tpl)).then(function (res) {
          if (angular.isObject(res)) {
            $templateCache.put(tpl, res.data);
            return res.data;
          }
          return res;
        });
      }
    }
  }]);
