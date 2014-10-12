'use strict';

(function(isNode, isAngular) {

  var activities = [
    { name: 'sport', textOver: 'Спорт и игры' },
    { name: 'hobby', textOver: 'Хобби и образование' },
    { name: 'cinema', textOver: 'Кино, театр, концерт' },
    { name: 'art', textOver: 'Искусство и дизайн' },
    { name: 'adventure', textOver: 'Путешествия и туризм' },
    { name: 'conference', textOver: 'Конференции и семинары' },
    { name: 'party', textOver: 'Вечеринки и встречи' },
    { name: 'flashmob', textOver: 'Флешмоб' },
    { name: 'other', textOver: 'Другое' }
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