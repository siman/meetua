'use strict';

angular.module('myApp')
  .service('EventService', ['$http', '$window', '$q', 'util', 'EventsResource', function($http, $window, $q, util, EventsResource) {
    var errorHandler = function(err) {
      console.error('Failed to save event ', err);
    };

    this.postSave = function(requestData, doRedirect) {
      new EventsResource(requestData).$save().then(function(res) {
        if (_.isUndefined(doRedirect)) {
          doRedirect = true;
        }
        if (doRedirect === true) {
          $window.location = res.event.url;
        }
      }, errorHandler);
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
            // Transform structure: {[events], friend} => {event, [friends]}
            var eventIds = [];
            var eventIdToFriendsMap = {};
            _.each(ress, function(res) {
              _.each(res.events, function(event) {
                var eid = event._id;
                if (_.isUndefined(eventIdToFriendsMap[eid])) {
                  eventIds.push(eid);
                  eventIdToFriendsMap[eid] = { event: event, friends: [] };
                }
                eventIdToFriendsMap[eid].friends.push(res.friend);
              });
            });
            var r = _.map(eventIds, function(eid) {
              return eventIdToFriendsMap[eid];
            });
            deferred.resolve(r);
          }, function(err) { deferred.reject(err); });
        }
      } else {
        deferred.resolve();
      }
      return deferred.promise;
    };
  }]);