angular.module('myApp')
  .service('ErrorService', ['$alert', function($alert) {
    function alert(msg) {
      $alert({title: 'Ошибка', content: msg, placement: top, type: 'danger', show: true, container: '#flash'});
    }

    this.alert = alert;
  }]);