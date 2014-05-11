'use strict';

var path = require('path');
var mongoose = require('mongoose');

var imageSchema = new mongoose.Schema({
    originalName: { type: String, required: true },
    type: { type: String, required: true },
    path: { type: String, required: true },
    isLogo: { type: Boolean, default: false }
});

imageSchema.virtual('url').get(function() {
  return '/upload/' + path.basename(this.path);
});
module.exports = mongoose.model('Image', imageSchema);