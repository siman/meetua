/**
 * Created by oleksandr on 10/11/14.
 */
'use strict';

var Event = require('../../models/Event');
var _ = require('underscore');
var fs = require('fs-extra');
var utils = require('../../controllers/util/utils');
var SharedEventService = require('../../../public/js/app/shared/services/event-service');
var logger = require('../../controllers/util/logger')(__filename);

/**
 * @param {Object} args
 * @param {ObjectId} args.eventId
 * @param {ObjectId} args.imageId
 * @param {ObjectId} args.userId
 * @param {Function} cb function(err, data)
 * @returns {*}
 */
function rmImage(args, cb) {
  var id = args.eventId;
  var imageId = args.imageId;
  var userId = args.userId;

  logger.debug('id: ' + id);
  logger.debug('imageId: ' + imageId);
  logger.debug('userId', userId);

  Event.findById(id, function(err, event) {
    if (err) return next(err);
    if (!event) utils.errorWithStatus('Неверные параметры запроса', 404);
    if (userId && !event.author.equals(userId)) cb(utils.errorWithStatus('forbidden', 403));

    var image = _.find(event.images, byId(imageId));
    if (!image) cb(utils.errorWithStatus('Неверные параметры запроса', 404));

    var imagePath = utils.savedImageNameToPath(image.name);
    logger.debug('removing image ' + imagePath);
    fs.remove(imagePath, function(err) {
      if (err) return cb(err);
      onRemoved();
    });
    function onRemoved() {
      event.images = _.reject(event.images, byId(imageId));
      SharedEventService.maybeChangeLogo(image, event.images);

      logger.debug('updating event ', JSON.stringify(event));
      event.save(function(err) {
        if (err) return cb(err);
        cb(null, {});
      });
    }
  });
}

function byId(expectedId) {
  return function(item) {
    return item._id.equals(expectedId);
  }
}

module.exports = rmImage;