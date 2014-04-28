'use strict';

var async = require('async');

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
        console.log("Found", entitySize, processor.entityName + "s in MongoDB. Preloading is not required");
        if (cb) {
          cb();
        }
      } else {
        console.log("Preloading MongoDB with mocked ", processor.entityName, "...");
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
            console.log("MongoDB has been preloaded with", savedSize, "out of", processor.mockEntities.length, processor.entityName + "s");
            if (cb) {
              cb();
            }
          }
        );
      }
    })
  };
};
