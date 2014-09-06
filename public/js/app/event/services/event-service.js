angular.module('myApp')
  .service('EventService', ['$http', '$window', '$q', 'util', function($http, $window, $q, util) {
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

    this.loadFriendsStream = function(currentUser, cb) {
      var deferred = $q.defer();
      if (currentUser) {
        var friends = currentUser.profile.friends;
        if (friends) {
          var fetchFriendsEvents = _.map(friends, function(friend) {
            return $http.get(util.apiUrl('/events/find'), {params: {participantId: friend._id}}).then(function(res) {
              return {events: res.data, friend: friend};
            });
          });
          $q.all(fetchFriendsEvents).then(function(ress) {
            // make {[events], friend} => {event: [friends]}
            var r = _.map(ress, function(res) {
              var r = _.map(res.events, function(event) {
                var friends = _.filter(_.map(ress, function(res) {
                  return _.contains(res.events, event) ? res.friend : undefined;
                }), function(friend) { return friend; });
                return {event: event, friends: friends};
              });
              return r;
            });
            r = _.reduce(_.flatten(r), function(memo, iter) {
              var existing = _.find(memo, function (v) {
                return v.event._id == iter.event._id
              });
              if (existing) {
                existing.friends = existing.friends.concat(iter.friends);
              } else {
                memo.push(iter);
              }
              return memo;
            }, []);
            deferred.resolve(r);
          }, function(err) { deferred.reject(err); });
        }
      } else {
        deferred.resolve();
      }
      return deferred.promise;
    };
  }]);