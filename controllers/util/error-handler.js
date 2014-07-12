module.exports.generateError = function(req, res, next){
  var err = new Error('database connection failed');
  next(err);
};