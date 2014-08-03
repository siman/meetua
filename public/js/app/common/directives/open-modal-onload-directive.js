angular.module('myApp')
  .directive('openModal', [
    function() {
      return {
        link: function (scope, element, attr) {
          $(window).load(function(){
            $('.' + attr.modalName).modal('show');
          });
        }
      };
    }
  ]);