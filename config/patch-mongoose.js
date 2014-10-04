'use strict';

// Patch mongoose bulk methods
// For the reason why we do this patch read this thread:
// https://groups.google.com/forum/#!msg/keystonejs/UG7jo4EDxd4/TYBjP1g-IW4J

var mongoose = require('mongoose');
var realModel = mongoose.model.bind(mongoose);
mongoose.model = function(name, schema) {
  var model = realModel(name, schema);
  var unsupported = function() { throw new Error("Sorry Dave, I can't do that"); };
  model.remove = unsupported;
  model.findAndRemove = unsupported;
  model.update = unsupported;
  model.findByIdAndUpdate = unsupported;
  model.findOneAndUpdate = unsupported;
  model.findOneAndRemove = unsupported;
  model.findByIdAndRemove = unsupported;
  return model;
};
