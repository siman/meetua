'use strict';

var Event = require('../../models/Event');
var _ = require('underscore');

module.exports = function (req, res, next) {
  console.log('cancel event');
  if (!req.user) return res.send(403);

  var eventId = req.params.id;
  if (!eventId) return res.send(404);

  Event.findOne({_id: eventId, author: req.user._id}, function (err, event) {
    if (err) return next(err);
    if (!event) return res.send(404);

    _.extend(event, {canceledOn: new Date()});

    event.save(afterSave());
    function afterSave() {
      console.log('notify users...');

      res.render('event/canceled', {
          title: 'Отмена события',
          event: event
        }
      );

    }
  });
};