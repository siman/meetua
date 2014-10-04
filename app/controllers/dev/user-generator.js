'use strict';

/**
 * Created by Alex Siman on 9/14/14.
 */

var logger = require('../util/logger')(__filename);
var async = require('async');
var _ = require('lodash');
var User = require('../../../app/models/User');
var rand = require('../util/rand');

// Data
var userNames = require('../../generator/user-names').userNames;
var genders = ['male', 'female'];

module.exports.view = function(req, res, next) {
  res.render('dev/user-generator', { title: 'User generator' });
};

module.exports.generate = function(req, res, next) {
  logger.debug('Generating mock users...');
  var params = req.body;
  logger.debug('Gen params', params);

  var fns = [];
  if (params.cleanDatabase) {
    fns.push(cleanDatabase);
  }
  fns.push(callGenerate);
  async.waterfall(fns, end);

  function cleanDatabase(cb) {
    User.find({isGenerated: true}, function(err, allUsers) {
      if (err) return cb(err);

      allUsers.forEach(function(user) {
        user.remove({}, function(err) {
          if (err) return cb(err);
          logger.debug('User', user.name, 'is removed');
        });
      });
      cb();
    });
  }

  function callGenerate(cb) {
    var userCountArr = []; // Size of array is a count of events to generate.
    for (var i = 0; i < params.userCount; i++) {
      userCountArr.push(i);
    }

    async.reduce(userCountArr, [], function(memo, item, cb) {
      generateRandomUser(function(err, user) {
        memo.push(user);
        cb(err, memo);
      });
    }, cb);

    function generateRandomUser(cb) {
      var gender = rand.randomArrItem(genders);
      var firstName = rand.randomArrItem(userNames.firstNames[gender]);
      var lastName = rand.randomArrItem(userNames.lastNames);
      var fullName = firstName + ' ' + lastName;
      var uuid = rand.random.uuid4();
      var email = uuid + '@example.com';

      var user = new User({
        isGenerated: true,
        email: email,
        password: uuid,
        profile: {
          name: fullName,
          gender: gender,
          location: 'Киев, Украина'
//          preferredActivities: [] // TODO
//          friends: [] // TODO
        },
        emailNotifications: {
          enabled: true,
          email: email
        }
      });

      user.save(function(err, user) {
        cb(err, user);
      })
    }
  }

  function end(err, users) {
    if (err) return res.json(500, err);
    res.json(200, users);
  }
};
