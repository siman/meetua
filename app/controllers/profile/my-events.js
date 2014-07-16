'use strict';

module.exports = function(req, res) {
    res.render('profile/my-events', {
        title: 'Мои события'
    });
};