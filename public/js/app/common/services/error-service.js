angular.module('myApp')
  .service('ErrorService', ['$alert', function($alert) { // TODO make it as factory, then IDEA recognizes it as object and autocompletion works correctly
    function alert(msg) {
      $alert({title: 'Ошибка', content: msg, placement: top, type: 'danger', show: true, container: '#flash'});
    }
    function handleResponse(res) {
      var err = (res.error ? res.error : res);
      var defaultMsg = 'Случилась ошибка, попробуйте повторить действие.';
      if (_.isArray(err)) { // array produced by req.validationErrors()
        _.each(err, function(item) {
          alert(item.msg || item);
        });
      } else if (_.isObject(err)) { // wtf ? error object ?
        alert(JSON.stringify(err));
      } else { // plain message
        alert(err || defaultMsg);
      }
    }

    this.alert = alert;
    this.handleResponse = handleResponse;
  }]);