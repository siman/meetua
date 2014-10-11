'use strict';

var Event = require('../../models/Event');
var _ = require('underscore');
var fs = require('fs-extra');
var utils = require('../util/utils');
var SharedEventService = require('../../../public/js/app/shared/services/event-service');
var logger = require('../util/logger')(__filename);
var imagesService = require('../../services/images');

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

  var args = {eventId: id, imageId: imageId, userId: userId};
  imagesService.remove(args, utils.sendJson2(res));
}

module.exports = rmImage;