var testUtil = require('../../test-util');
var dbPreload = require('../../../controllers/event/EventStore').dbPreload;
var mockEvents = require('../../../controllers/event/MockEvents');
var Event = require('../../../models/Event');

describe('event store', function() {
  beforeEach(testUtil.mongoConnect);
  afterEach(testUtil.mongoDisconnect);

  it('should preload mock events in db when it\'s empty', function(done) {
    Event.remove({}, function(err) {
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
    Event.remove({}, function(err) {
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