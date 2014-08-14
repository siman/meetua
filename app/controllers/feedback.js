'use strict';

exports.get_feedback = function(req, res, next) {
  res.render('feedback', {title: 'Отзывы и предложения'});
};