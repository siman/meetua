'use strict';

(function(isNode, isAngular) {

  // TODO: Rename activities
  var activities = [
    {name: 'bike', textOver: 'Велосипед'}, // cycling
    {name: 'running', textOver: 'Бег'},
    {name: 'workout', textOver: 'Workout'},
    {name: 'hiking', textOver: 'Туризм'},  // tourism
    {name: 'photo', textOver: 'Фото'},     // ?? remove ??
    {name: 'en', textOver: 'Языки'},       // langs
    {name: 'code', textOver: 'IT'},        // it
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