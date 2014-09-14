/**
 * Created by oleksandr on 9/14/14.
 */
'use strict';

var eventsService = require('../services/events');
var _ = require('lodash');

/**
 * Keep our controllers 'thin'.
 * @see {@link http://sailsjs.org/#/documentation/concepts/Controllers?q=thin-controllers}
 */
module.exports = {
  save: function(req, res, next) {
    var args = { params: req.body, isCreate: _.isUndefined(req.body._id), currentUser: req.user, flashFn: req.flash.bind(req) };
    eventsService.save(args, function returnResp(respStatus, respData) {
      res.json(respStatus, respData);
    });
  }
};