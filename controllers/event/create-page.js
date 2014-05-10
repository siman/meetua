'use strict';

module.exports = function(req, res) {
    res.render('event/create', {
        title: 'Создать событие'
    });
};