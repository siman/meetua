'use strict';

angular.module('myApp')
  .directive('placeMap', ['BASE_MAP', 'KIEV_MAP', '$timeout', function(BASE_MAP, KIEV_MAP, $timeout) {
    function controller($scope) {
      $scope.updateMapLatLng = function(lat, lng) {
        $scope.map.center.latitude = $scope.lat = lat;
        $scope.map.center.longitude = $scope.lng = lng;
      };
      $scope.placeOptions={
        country: 'ua'
      };
      $scope.map = _.extend(BASE_MAP, KIEV_MAP, {
        marker: {
          options: {draggable: true},
          events: {
            dragend: function(event) {
              $timeout(function(){
                // update map when user drags marker
                $scope.updateMapLatLng(event.position.lat(), event.position.lng());
              });
            }
          }
        }
      });
    }
    function link(scope) {
      scope.$watch('details', function(details){
        if (details) {
          // update map when details changed in input
          scope.updateMapLatLng(details.geometry.location.lat(), details.geometry.location.lng());
          // increase zoom when details provided
          if (scope.map.zoom == KIEV_MAP.zoom) {
            scope.map.zoom = KIEV_MAP.zoom + 4;
          }
        }
      });
    }

    return {
      restrict: 'E',
      templateUrl: '/tpl/place-map-tpl',
      link: link,
      controller: controller,
      scope: {
        details: '=',
        lat: '=',
        lng: '='
      }
    };
  }]);