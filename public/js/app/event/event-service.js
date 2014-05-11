angular.module('myApp')
  .service('EventService', ['$http', '$window', function($http, $window) {
    this.postSave = function(requestData) {
      $http.post('/event/save', requestData).success(function(res){
        console.log('Event is saved successfully ', res);
        var redirectUrl = '/event/' + res.event._id;
        console.log('Redirecting to ', redirectUrl);
        $window.location = redirectUrl;
      }).error(function(err) {
        console.error('Failed to save event ', err);
      });
    }
  }]);