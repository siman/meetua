/**
 * Created by oleksandr on 10/11/14.
 */
var config = {
  configurable: true,
  value: function() {
    var alt = {};
    var storeKey = function(key) {
      alt[key] = this[key]
    };
    Object.getOwnPropertyNames(this).forEach(storeKey, this);
    return alt
  }
};
// javascript sucks, we need to manually implement JSON serialization for Error
// http://massalabs.com/dev/2013/10/17/handling-errors-in-nodejs.html
Object.defineProperty(Error.prototype, 'toJSON', config);