'use strict';

var mongoose = require('mongoose');

var imageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, required: true },
    path: { type: String, required: true },
    isLogo: { type: Boolean, default: false }
});

module.exports = mongoose.model('Image', imageSchema);