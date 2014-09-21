/**
 * Created by oleksandr on 9/21/14.
 */
'use strict';
var ObjectId = require('mongoose').Types.ObjectId;
var chai = require('chai');
chai.use(function(_chai, utils) {
  chai.Assertion.addMethod('objectId', function(propName, expectedId) {
    var obj = utils.flag(this, 'object');
    var actualId = utils.getPathValue(propName, obj);
    this.assert(actualId.equals(expectedId),
      'expected #{this} to equal #{exp}',
      'expected #{this} to not equal #{exp}',
      expectedId.toString(), actualId.toString(), true);
  });
});
var should = chai.should();
var eventsService = require('../../services/events');
var moment = require('moment');
var tk = require('timekeeper');
var testUtil = require('../../spec/test-util');
testUtil.initDb();

describe('events-service', function() {
  describe('find', function() {
    describe('should map request', function() {
      beforeEach(function() {
        tk.reset(); // drop date freezing
      });
      it('act', function() {
        mapAndExpect({act: 'aa'}, {filter: {activity: 'aa'}});
      });
      it('passed', function() {
        var now = moment('2014-09-20');
        tk.freeze(now.toDate());
        mapAndExpect({passed: true}, {filter: {start: {dateTime: {$gt: now.valueOf()}}}});
        mapAndExpect({passed: false}, {filter: {start: {dateTime: {$lte: now.valueOf()}}}});
      });
      it('canceled', function() {
        mapAndExpect({canceled: true}, {filter: {canceledOn: {$exists: true}}});
        mapAndExpect({canceled: false}, {filter: {canceledOn: {$exists: false}}});
      });
      it('participant', function() {
        eventsService.findQuery({participantId: "5355443a9e965c7c19f33c43"}).should.
          have.objectId('filter.participants.$elemMatch.user', ObjectId("5355443a9e965c7c19f33c43"));
      });
      it('author', function() {
        eventsService.findQuery({authorId: "5355443a9e965c7c19f33c43"}).should.
          have.objectId('filter.author', ObjectId("5355443a9e965c7c19f33c43"));
      });
      it('limit', function() {
        mapAndExpect({limit: 1}, {filter:{}, limit:1});
      });
      it('empty args', function() {
        mapAndExpect({}, {filter: {}});
      });
    });
    describe('should not fail', function(done) {
      var tests = [
        {name: 'act', args: {act: 'aa'}, status: 200},
        {name: 'passed true', args: {passed: true}, status: 200},
        {name: 'passed false', args: {passed: false}, status: 200},
        {name: 'canceled true', args: {canceled: true}, status: 200},
        {name: 'canceled false', args: {canceled: false}, status: 200},
        {name: 'participant', args: {participantId: "5355443a9e965c7c19f33c43"}, status: 200},
        {name: 'author', args: {authorId: "5355443a9e965c7c19f33c43"}, status: 200},
        {name: 'limit', args: {limit: 1}, status: 200},
        {name: 'empty args', args: {}, status: 200}
      ];
      runTests(tests);
    });
    describe('should fail', function() {
      it('invalid author', function(done) {
        eventsService.find({authorId: 'ss'}, isStatus(done, 500));
      });
    });
  });
  function mapAndExpect(args, expectedRes) {
    eventsService.findQuery(args).should.be.deep.equal(expectedRes);
  }
  function isStatus(done, expectedStatus) {
    return function(status, data) {
      status.should.equal(expectedStatus);
      done();
    }
  }
  function runTests(tests) {
    tests.forEach(function(test) {
      it(test.name, function(done) {
        eventsService.find(test.args, isStatus(done, test.status));
      });
    });
  }
});

