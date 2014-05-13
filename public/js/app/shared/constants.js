'use strict';

(function(isNode, isAngular) {

  var activities = [
    {name: 'bike', textOver: 'Велосипед'},
    {name: 'running', textOver: 'Бег'},
    {name: 'workout', textOver: 'Workout'},
    {name: 'hiking', textOver: 'Туризм'},
    {name: 'photo', textOver: 'Фото'},
    {name: 'en', textOver: 'Языки'},
    {name: 'code', textOver: 'IT'},
    {name: 'other', textOver: 'Другое', hide: true /*temp*/} // TODO find image for 'other'
  ];

  if (isAngular) {
    angular.module('myApp.shared')
      .constant('activities', _.filter(activities, function(activity) {
        return !activity.hide;
      }));
  } else if (isNode) {
    module.exports.activities = activities;
  }

})(typeof module !== 'undefined' && module.exports,
    typeof angular !== 'undefined');