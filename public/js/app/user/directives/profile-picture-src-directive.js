'use strict';
/**
 * Created by oleksandr at 6/9/14 2:46 PM
 */
angular.module('myApp')
  .directive('profilePictureSrc', ['$parse', 'GravatarService', function($parse, GravatarService) {
    function link($scope, element, attrs) {
      var userStrInScope = attrs.profilePictureSrc;
      $scope.$watch(userStrInScope, function(user) {
        if (user) {
          if (user.profile && user.profile.picture) {
            element.attr('src', user.profile.picture);
          } else {
            var size = attrs.size || 60;
            var gravatarLink = GravatarService.gravatarLink(user, size);
            element.attr('src', gravatarLink);
          }
        }
      });

    }
    return {
      restrict: 'A',
      link: link
    };
  }]);