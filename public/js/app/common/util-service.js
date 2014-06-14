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

    /**
     * @param {{Object}} original original image dimensions or Image instance
     * @param {Number} [original.width]
     * @param {Number} [original.height]
     * @param {Object} desired desired image dimensions
     * @param {Number} [desired.width]
     * @param {Number} [desired.height]
     * @returns {Object} with width and height calculated
     */
    function calculateImgDimensions(original, desired) {
      var width = desired.width || original.width / original.height * desired.height;
      var height = desired.height || original.height / original.width * desired.width;
      console.log('original: %sx%s, desired: %sx%s, calculated: %sx%s',
        original.width, original.height, desired.width, desired.height, width, height);
      return {
        width: width,
        height: height
      };
    }

    return {
      fetchTpl: fetchTpl,
      apiUrl: apiUrl,
      calculateImgDimensions: calculateImgDimensions
    }
  }]);
