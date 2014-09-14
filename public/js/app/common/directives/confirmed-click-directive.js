angular.module('myApp')
  .directive('confirmedClick', ['$modal',
  function($modal) {
    return {
      scope: {
        yesText: '@',
        noText: '@',
        confirmation: '@',
        confirmFn: '&confirmedClick'
      },
      link: function ($scope, element, attr) {
        element.bind('click',function (event) {
          var modal = $modal({
            title: 'Подтверждение операции',
            html: true,
            template: '/tpl/confirmed-click-tpl'
          });
          modal.$scope.yesText = $scope.yesText;
          modal.$scope.noText = $scope.noText;
          modal.$scope.confirmation = $scope.confirmation;
          modal.$scope.confirm = function() {
            $scope.confirmFn();
            modal.hide();
          };
        });
      }
    };
  }]);
