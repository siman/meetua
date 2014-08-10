'use strict';

(function(isNode, isAngular) {

  // TODO: Rename activities
  var activities = [
    {name: 'bike', textOver: 'Велосипед', img: 'bike-icon-128.png'}, // cycling
    {name: 'running', textOver: 'Бег', img: 'running-man-icon-128.png'},
    {name: 'workout', textOver: 'Workout', img: 'street-workout.png'},
    {name: 'hiking', textOver: 'Туризм', img: 'mountain.jpg'},  // tourism
    {name: 'photo', textOver: 'Фото', img: 'camera_icon.png'},     // ?? remove ??
    {name: 'en', textOver: 'Языки', img: 'english-icon.png'},       // langs
    {name: 'code', textOver: 'IT', img: 'code_icon.png'},        // it
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