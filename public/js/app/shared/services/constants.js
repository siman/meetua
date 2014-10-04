'use strict';

(function(isNode, isAngular) {

  var activities = [
    {name: 'cycling', textOver: 'Велосипед', img: 'bike-icon-128.png'},
    {name: 'running', textOver: 'Бег', img: 'running-man-icon-128.png'},
    {name: 'workout', textOver: 'Workout', img: 'street-workout.png'},
    {name: 'tourism', textOver: 'Туризм', img: 'mountain.jpg'},
    {name: 'photo', textOver: 'Фото', img: 'camera_icon.png'},     // ?? remove ??
    {name: 'langs', textOver: 'Языки', img: 'english-icon.png'},
    {name: 'it', textOver: 'IT', img: 'code_icon.png'},
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