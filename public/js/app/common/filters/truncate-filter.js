/**
 * Created by oleksandr on 9/3/14.
 */

/**
 * Truncate Filter
 * @Param text
 * @Param length, default is 10
 * @Param end, default is "..."
 * @return string
 */
angular.module('myApp').
  filter('truncate', function () {
    return function (text, length, end) {
      if (!text) {
        return
      }

      if (isNaN(length))
        length = 10;

      if (end === undefined)
        end = "...";

      if (text.length <= length || text.length - end.length <= length) {
        return text;
      }
      else {
        return String(text).substring(0, length-end.length) + end;
      }

    };
  });