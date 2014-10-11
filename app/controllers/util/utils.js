'use strict';

var async = require('async');
var path = require('path');
var config = require('../../../config/app-config');
var logger = require('./logger.js')('util.js');
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

exports.getUserIdOpt = function(req) {
  return req.user ? req.user._id : undefined;
};

exports.isGuestMiddleware = function(req, res, next) {
  if (req.user) {
    res.redirect('/');
  } else {
    next();
  }
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

/**
 * Prepend prefix to file name
 * @param filePath file path to modify
 * @param prefix prefix to add to the file name
 * @return newPath
 */
module.exports.prefixFileName = function(filePath, prefix) {
  var newName = prefix + path.basename(filePath);
  var newPath = path.join(path.dirname(filePath), newName);
  return newPath;
};

/**
 * Rename file prepending the prefix to it's name, taken from path.basename
 * @param filePath - path to rename
 * @param prefix - prefix to prepend to the file name
 * @param next - callback(error, newPath)
 */
module.exports.renamePrefix = function(filePath, prefix, next) {
  var newPath = module.exports.prefixFileName(filePath, prefix);
  fs.rename(filePath, newPath, function(err) {
    next(err, newPath);
  });
};

/**
 * @deprecated
 */
module.exports.sendJson = function sendJson(res) {
  return function doReturn(status, data) {
    res.json(status, data);
  }
};

module.exports.sendJson2 = function sendJson(res) {
  return function doReturn(err, data) {
    var statusCode = !err ? 200 : err.statusCode ? err.statusCode : 500; // unexpected error, came from third party code
    res.json(statusCode, data);
  }
};

/**
 * Create error with http status code and msg
 * @param msg - error message
 * @param status - http status code
 */
module.exports.errorWithStatus = function(msg, status) {
  var err = new Error(msg);
  err.statusCode = status;
  return err;
};

module.exports.scaleToCover = function dimensionsToCover(sourceWidth, sourceHeight, targetWidth, targetHeight) {
  var xscale = targetWidth / sourceWidth;
  var yscale = targetHeight / sourceHeight;
  return {xscale: xscale, yscale: yscale};
};
/**
 * Calculate image dimensions to perform cover transformation
 * @param targetWidth
 * @param targetHeight
 * @param sourceWidth
 * @param sourceHeight
 * return {width, height}
 */
module.exports.dimensionsToCover = function dimensionsToCover(sourceWidth, sourceHeight, targetWidth, targetHeight) {
  var scales = module.exports.scaleToCover(sourceWidth, sourceHeight, targetWidth, targetHeight);

  if (scales.xscale > scales.yscale) {
    return {width: (sourceWidth * scales.xscale), height: (sourceHeight * scales.xscale)};
  } else {
    return {width: (sourceWidth * scales.yscale), height: (sourceHeight * scales.yscale)};
  }
};