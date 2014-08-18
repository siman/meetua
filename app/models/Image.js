'use strict';

var path = require('path');
var mongoose = require('mongoose');
var mime = require('mime');

var imageSchema = new mongoose.Schema({
    originalName: { type: String, required: true },
    type: { type: String, required: true },
    name: { type: String, required: true },
    isLogo: { type: Boolean, default: false }
});

imageSchema.virtual('url').get(function() {
  return '/upload/' + this.name;
});

imageSchema.statics.newLogoFromPath = function(imagePublicPath) {
  var imgName = path.basename(imagePublicPath);
  return new this({
    type: mime.lookup(imgName),
    originalName: imgName,
    name: imgName,
    isLogo: true
  });
};

module.exports = mongoose.model('Image', imageSchema);