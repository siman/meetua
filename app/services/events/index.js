/**
 * Created by oleksandr on 9/14/14.
 */
'use strict';

var saveAction = require('./save-event');

/**
 * Encapsulates internal implementation, so it's easy to refactor it. Also may keep common logic for event actions.
 */
module.exports = {
  save: function(params, cb) {
    saveAction._saveEvent(params, cb);
  }
};