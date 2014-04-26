angular.module('myApp')
  .factory('eventFormatDateService', function() {
    return {
      addDisplayData : function(event) {
        event.start.displayDate = moment(event.start.date).format('Do MMMM');
        event.start.displayDayOfWeek = moment(event.start.date).format('dddd');
        event.start.displayTime = moment(event.start.date).format('HH:mm');
        return event;
      }
    }
  });