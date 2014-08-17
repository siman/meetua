'use strict';

var async = require('async');
var path = require('path');
var config = require('../../config/app-config');
var logger = require('./util/logger.js')('util.js');
var crypto = require('crypto');
var tmp = require('tmp');
var fs = require('fs-extra');

/**
 *
 * @param processor = {
    count: function(cb) {} - calculates entities count in the db and passes (err, entitySize) into cb
    mockEntities: [] - entities array, that should be inserted in the db if it's empty
    entityConstructor: new Constructor(entity) - receives mock entity and creates mongodb model instance
    entityName: String - name of entity to put in the log messages
  };
 returns function(cb)
 */
exports.dbPreload = function(processor) {
  return function(cb) {
    processor.count(function(err, entitySize) {
      if (entitySize > 0) {
        logger.info("Found", entitySize, processor.entityName + "s in MongoDB. Preloading is not required");
        if (cb) {
          cb();
        }
      } else {
        logger.debug("Preloading MongoDB with mocked ", processor.entityName, "...");
        async.reduce(processor.mockEntities, 0,
          function(savedSize, mockEntity, callback) {
            var newEntity = new processor.entityConstructor(mockEntity);
            newEntity.save(function(err, savedEntity) {
              if (err) {
                console.error("Failed to save mocked " + processor.entityName, err);
              } else {
                savedSize++;
              }
              callback(null, savedSize);
            })
          }, function(err, savedSize) {
            logger.info("MongoDB has been preloaded with", savedSize, "out of", processor.mockEntities.length, processor.entityName + "s");
            if (cb) {
              cb();
            }
          }
        );
      }
    })
  };
};


exports.savedImageNameToPath = function(name) {
  return path.join(config.EVENT_IMG_DIR, name);
};

exports.uploadedImageNameToPath = function(name) {
  return path.join(config.UPLOAD_DIR, name);
};

exports.generateToken = function(done) {
  crypto.randomBytes(16, function(err, buf) {
    var token = buf.toString('hex');
    done(err, token);
  });
};

var Random = require("random-js");
var random = new Random(Random.engines.mt19937().autoSeed());

exports.random = function(min, max) {
  return random.integer(min, max);
};

exports.getUserIdOpt = function(req) {
  return req.user ? req.user._id : undefined;
};

/**
 * Move file to specified directory generating unique name preserving file extension.
 * @param srcPath - source file path
 * @param destDir - destination dir
 * @param fileExtension - extension of the file
 * @param next
 */
module.exports.moveFile = function(srcPath, destDir, next) {
  logger.debug('move', srcPath, '->', destDir, 'is requested');
  tmp.tmpName({ dir: destDir, prefix: 'event-', postfix: path.extname(srcPath), tries: 100},
    function(err, destPath) {
      logger.debug('Created unique name ', destPath);
      logger.debug('Moving ', srcPath, ' to ', destPath);
      fs.copy(srcPath, destPath, function(err) {
        if (err) return next(err);

        fs.unlink(srcPath, function(err) {
          if (err) {
            console.error('Cannot unlink file ', srcPath, err);
          }
          next(null, destPath);
        });
      });
    });
};
// TODO refactor moveFile and copyFile
module.exports.copyFile = function(srcPath, destDir, next) {
  logger.debug('move', srcPath, '->', destDir, 'is requested');
  tmp.tmpName({ dir: destDir, prefix: 'event-', postfix: path.extname(srcPath), tries: 100},
    function(err, destPath) {
      logger.debug('Created unique name ', destPath);
      logger.debug('Moving ', srcPath, ' to ', destPath);
      fs.copy(srcPath, destPath, function(err) {
        if (err) return next(err);
        next(null, destPath);
      });
    });
};