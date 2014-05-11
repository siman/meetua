'use strict';

var path = require('path');
var mongoose = require('mongoose');

var imageSchema = new mongoose.Schema({
    originalName: { type: String, required: true },
    type: { type: String, required: true },
    name: { type: String, required: true },
    isLogo: { type: Boolean, default: false }
});

imageSchema.virtual('url').get(function() {
  return '/upload/' + this.name;
});
module.exports = mongoose.model('Image', imageSchema);