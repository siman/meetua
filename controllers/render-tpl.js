var renderTpl = function(req, res, next) {
  _renderTpl(req.path, res);
};

var _renderTpl = function(path, res) {
  var directoryTraversal = path.indexOf('..') !== -1;
  var inTpl = path.indexOf('/tpl') === 0;
  if (directoryTraversal || !inTpl) {
    res.send(400); // bad request
  } else {
    if (path.indexOf('/') === 0) {
      path = path.substring(1);
    }
    res.render(path);
  }
};

// for unit tests
exports._renderTpl = _renderTpl;

exports.renderTpl = renderTpl;