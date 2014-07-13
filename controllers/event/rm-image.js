var Event = require('../../models/Event');
var _ = require('underscore');
var fs = require('fs-extra');
var utils = require('../utils');
var SharedEventService = require('../../public/js/app/shared/event-service');

function rmImage(req, res, next) {
  req.checkParams('id', 'event id is invalid').isAlphanumeric();
  req.checkParams('imageId', 'image id is invalid').isAlphanumeric();

  var id = req.params.id;
  var imageId = req.params.imageId;
  var userId = utils.getUserIdOpt(req);

  Event.findById(id, function(err, event) {
    if (err) return next(err);
    if (!event) res.send(404);
    if (userId && !event.author.equals(userId)) res.send(403);
    // TODO user can rm only images for his own events, test

    var image = _.find(event.images, byId(imageId));
    if (!image) res.send(404);

    var imagePath = utils.savedImageNameToPath(image.name);
    fs.remove(imagePath, function(err) {
      if (err) return res.json(500, {error: err});
      onRemoved();
    });
    function onRemoved() {
      event.images = _.reject(event.images, byId(imageId));
      SharedEventService.maybeChangeLogo(image, event.images);

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