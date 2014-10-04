'use strict';

var Event = require('../../models/Event');
var _ = require('underscore');
var fs = require('fs-extra');
var utils = require('../util/utils');
var SharedEventService = require('../../../public/js/app/shared/services/event-service');
var logger = require('../util/logger')(__filename);

function rmImage(req, res, next) {
  req.checkParams('id', 'event id is invalid').isAlphanumeric();
  req.checkParams('imageId', 'image id is invalid').isAlphanumeric();

  var errors = req.validationErrors(true);

  if (errors) {
    logger.debug('errors ' + JSON.stringify(errors));
    return res.json(400, errors);
  }

  var id = req.params.id;
  var imageId = req.params.imageId;
  var userId = utils.getUserIdOpt(req);

  logger.debug('id: ' + id);
  logger.debug('imageId: ' + imageId);
  logger.debug('userId', userId);

  Event.findById(id, function(err, event) {
    if (err) return next(err);
    if (!event) res.send(404, 'Неверные параметры запроса');
    if (userId && !event.author.equals(userId)) res.send(403);

    var image = _.find(event.images, byId(imageId));
    if (!image) res.send(404, 'Неверные параметры запроса');

    var imagePath = utils.savedImageNameToPath(image.name);
    logger.debug('removing image ' + imagePath);
    fs.remove(imagePath, function(err) {
      if (err) return res.json(500, {error: err});
      onRemoved();
    });
    function onRemoved() {
      event.images = _.reject(event.images, byId(imageId));
      SharedEventService.maybeChangeLogo(image, event.images);

      logger.debug('updating event ', JSON.stringify(event));
      event.save(function(err) {
        if (err) return res.json(500, {error: err});
        res.send(200);
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