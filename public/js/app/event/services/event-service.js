angular.module('myApp')
  .service('EventService', ['$http', '$window', function($http, $window) {
    var errorHandler = function(err) {
      console.error('Failed to save event ', err);
    };

    this.postSave = function(requestData, doRedirect) { // TODO redirect to different urls on edit and create
      console.log("req data: ", requestData);
      $http.post('/event/save', requestData).success(function(res){
        console.log('Event is saved successfully ', res);
        if (_.isUndefined(doRedirect)) {
          doRedirect = true;
        }
        if (doRedirect === true) {
          var redirectUrl = '/event/' + res.event._id;
          console.log('Redirecting to ', redirectUrl);
          $window.location = redirectUrl;
        }
      }).error(errorHandler);
    };
    /**
     * @param opts
     * @param opts.eventId
     * @param opts.imageId
     * @param cb
     */
    this.postRemoveImage = function(opts, cb) {
      $http.post('/event/' + opts.eventId + '/rm-image/' + opts.imageId).success(cb).error(errorHandler);
    };
  }]);