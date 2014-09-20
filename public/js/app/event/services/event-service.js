'use strict';

angular.module('myApp')
  .service('EventService', ['$http', '$window', '$q', 'util', 'EventsResource', function($http, $window, $q, util, EventsResource) {
    var errorHandler = function(err) {
      console.error('Failed to save event ', err);
    };

    this.goToEvent = function(event) {
      window.location.href = event.url;
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
            return EventsResource.query({participantId: friend._id}).$promise.then(function(res) {
              return {events: res, friend: friend};
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