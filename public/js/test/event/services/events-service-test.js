'use strict';


/**
 * Created by oleksandr on 9/5/14.
 */
describe('EventsService', function() {
  var $httpBackend, EventsService;
  var should = chai.should();
  var friend1 = {_id: 'AA'};
  var friend2 = {_id: 'BB'};
  var currentUser = {
    profile: {
      friends: [friend1, friend2]
    }
  };
  var event1 = {
    "_id": "event-1",
    "participants": [
      {
        "user": "AA"
      },
      {
        "user": "BB"
      }
    ]
  };
  var event2 = {
    "_id": "event-2",
    "participants": [
      {
        "user": "AA"
      }
    ]
  };
  beforeEach(module('myApp'));
  beforeEach(inject(function($injector) {
    EventsService = $injector.get('EventsService');
    $httpBackend = $injector.get('$httpBackend');
    $httpBackend.whenGET('/api/meetua/events?participantId=AA').respond([event1, event2]);
    $httpBackend.whenGET('/api/meetua/events?participantId=BB').respond([event1]);
  }));
  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });
  describe('$scope.loadFriendsStream()', function() {
    beforeEach(function() {
      $httpBackend.expectGET('/api/meetua/events?participantId=AA');
      $httpBackend.expectGET('/api/meetua/events?participantId=BB');
    });
    it('should load events by participant id', function() {
      EventsService.loadFriendsStream(currentUser);
      $httpBackend.flush();
    });
    it('should group by event', function() {
      EventsService.loadFriendsStream(currentUser).then(function(res) {
        res.should.have.a.deep.property('0.event._id', 'event-1');
        res.should.deep.property('0.friends').contain(friend1);
        res.should.deep.property('0.friends').contain(friend2);
        res.should.deep.property('1.event._id').contain('event-2');
        res.should.deep.property('1.friends').contain(friend1);
      });
      $httpBackend.flush();
    });
  });
});