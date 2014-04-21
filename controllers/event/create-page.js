var eventService = require('../../public/js/ng/shared/event-service');

module.exports = function(req, res) {
    console.log('Shared eventService ', eventService.createEvent());
    res.render('create-event', {
        title: 'Создать событие'
    });
};