/**
 * Created by oleksandr on 9/14/14.
 */
'use strict';

angular.module('myApp')
  .factory('EventsResource', ['$resource', 'util', function($resource, util) {
    return $resource(util.apiUrl('/events/:eventId'), {eventId: '@_id'},
      {cancel: {method:'POST', url: util.apiUrl('/events/:eventId/cancel')}}
    );
  }]);