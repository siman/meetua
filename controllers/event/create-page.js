var eventService = require('../../public/js/ng/shared/event-service');

module.exports = function(req, res) {
    console.log('Shared eventService ', eventService.createEvent());
    res.render('event/create', {
        title: 'Создать событие'
    });
};