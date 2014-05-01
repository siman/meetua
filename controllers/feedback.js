'use strict';

/**
 * Created by Alex on 5/1/14.
 */

exports.get_feedback = function(req, res, next) {
  res.render('feedback', {title: 'Отзывы'});
};