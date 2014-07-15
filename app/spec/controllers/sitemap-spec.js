var testUtil = require('../test-util');
var request = require('supertest');
var express = require('express');
var sitemap = require('../../../app/controllers/sitemap');
var EventStore = require('../../../app/controllers/event/EventStore');
var Event = require('../../../app/models/Event');
var _ = require('underscore');

describe('sitemap', function () {
  var app = express();
  app.use('/sitemap.xml', sitemap);


  beforeEach(testUtil.mongoConnect);
  afterEach(testUtil.mongoDisconnect);

  it('should build sitemap', function (done) {
    EventStore.dbPreload();

    Event.find({}, function (err, events) {
      if (err) return done(err);

      sitemap._buildSitemap(function (err, sitemap) {
        if (err) return done(err);

        var expectedUrls = _.map(events, function (event) {
          return { url: '/event/' + event._id, changefreq: 'daily', priority: 0.5 }
        });

        expect(sitemap.urls).toEqual(expectedUrls);
        expect(sitemap.hostname).toEqual('http://meetua.com');
        done();
      });
    });
  });
});