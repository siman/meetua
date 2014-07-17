var appConfig = require('../../config/app-config');

/**
 * POST /git-push
 */
module.exports.gitPush = function(req, res, next) {
  res.json(req.body);
}