angular.module('myApp')
  .service('ErrorService', ['$alert', function($alert) { // TODO make it as factory, then IDEA recognizes it as object and autocompletion works correctly
    function alert(msg) {
      $alert({title: 'Ошибка', content: msg, placement: top, type: 'danger', show: true, container: '#flash'});
    }

    this.alert = alert;
  }]);