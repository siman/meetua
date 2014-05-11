var Event = require('../../models/Event');
var _ = require('underscore');
var fs = require('fs-extra');
var util = require('../util');
var SharedEventService = require('../../public/js/app/shared/event-service');

function rmImage(req, res, next) {
  req.checkParams('id', 'event id is invalid').isAlphanumeric();
  req.checkParams('imageId', 'image id is invalid').isAlphanumeric();

  var id = req.params.id;
  var imageId = req.params.imageId;
  var userId = req.user._id;

  Event.findById(id, function(err, event) {
    if (err) return next(err);
    if (!event) res.send(404);
    if (!event.author.equals(userId)) res.send(403);

    var image = _.find(event.images, byId(imageId));
    if (!image) res.send(404);

    var imagePath = util.savedImageNameToPath(image.name);
    fs.remove(imagePath, function(err) {
      if (err) return res.json(500, {error: err});
      onRemoved();
    });
    function onRemoved() {
      var updateObject = event.toObject();
      updateObject.images = _.reject(updateObject.images, byId(imageId));
      SharedEventService.onRemoved(image, updateObject.images);

      delete updateObject._id;
      Event.update({_id: id}, updateObject, function(err) {
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