var testUtil = require('../../test-util');
var dbPreload = require('../../../../app/controllers/event/event-store').dbPreload;
var mockEvents = require('../../../../app/controllers/event/mock-events');
var Event = require('../../../../app/models/Event');
var _ = require('underscore');

describe('event store', function() {
  beforeEach(testUtil.mongoConnect);
  afterEach(testUtil.mongoDisconnect);

  it('should preload mock events in db when it\'s empty', function(done) {
    removeAllEvents(function(err) {
      if (err) return done(err);
      doPreload();
    });
    function doPreload() {
      dbPreload(function onPreloaded() {
        Event.count(function(err, eventsCount) {
          if (err) return done(err);
          expect(eventsCount).toBe(mockEvents.length);
          done();
        });
      });
    }
  });

  it('should not preload mock events when there are events in the db', function(done) {
    removeAllEvents(function(err) {
      if (err) return done(err);
      new Event(mockEvents[0]).save(function(err, createdEvent) {
        doPreload();
      });
    });
    function doPreload() {
      dbPreload(function onPreloaded() {
        Event.count(function(err, eventsCount) {
          if (err) return done(err);
          expect(eventsCount).toBe(1);
          done();
        });
      });
    }
  });
});

function removeAllEvents(cb) {
  Event.find({}, function(err, events) {
    if (err) return cb(err);
    _.each(events, function(event) {
      event.remove();
    });
    cb(null);
  });
}