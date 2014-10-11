/**
 * Created by oleksandr on 10/11/14.
 */
'use strict';
var fs = require('fs-extra');
var utils = require('../../controllers/util/utils');
var os = require('os');
var should = require('chai').should();
var path = require('path');

describe('utils', function() {
  var tmp = os.tmpDir();
  describe('prefixFileName', function() {
    it('should rename file', function(done) {
      var fpath = path.join(tmp, 'myfile');
      fs.writeFile(fpath, function(err) {
        if (err) return done(err);
        utils.renamePrefix(fpath, 'pref-', function(err, newPath) {
          newPath.should.eql(path.join(tmp, 'pref-' + 'myfile'));
          done();
        });
      });
    });
  });
  describe('dimensionsToCover', function() {
    it('should calculate dimensions', function() {
      utils.dimensionsToCover(1280, 1024, 400, 400).should.be.deep.equal({width:500, height:400});
    });
  });
});