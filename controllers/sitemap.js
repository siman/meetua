var Event = require('../models/Event');
var _ = require('underscore');
var sm = require('sitemap');
var appConfig = require('../config/app-config');

var _sitemap = {};

var rebuildTimerId = null;

buildSitemap(assignSitemapOrThrow);

function getSitemap(req, res, next) {
  res.header('Content-Type', 'application/xml');
  res.send( _sitemap.toString() );
}

function scheduleSitemapRebuild(ms) {
  if (rebuildTimerId) {
    clearInterval(rebuildTimerId);
  }

  rebuildTimerId = setInterval(function() {
    buildSitemap(assignSitemapOrThrow);
  }, ms);
}


function assignSitemapOrThrow(err, sitemap) {
  if (err) throw err;
  _sitemap = sitemap;
}

function buildSitemap(cb) {
  buildUrls(function(err, urls) {
    if (err) return cb(err);

    var sitemap = sm.createSitemap ({
      hostname: appConfig.hostname,
      cacheTime: 600000,  // 600 sec cache period for generated xml, default from examples
      urls: urls
    });
    cb(null, sitemap);
  });

}

function buildUrls(cb) {
  Event.find({}, function(err, events) {
    if (err) return cb(err);
    var urls = _.map(events, function(event) {
      return { url: '/event/' + event._id, changefreq: 'daily', priority: 0.5 }
    });
    cb(null, urls);
  });
}

module.exports.getSitemap = getSitemap;
module.exports.scheduleSitemapRebuild = scheduleSitemapRebuild;
module.exports._buildSitemap = buildSitemap;
