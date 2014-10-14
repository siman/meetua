'use strict';

/**
 * Created by Alex Siman on 9/14/14.
 */

var moment = require('moment');
var Random = require("random-js");
var random = new Random(Random.engines.mt19937().autoSeed());

exports.random = random;
exports.randomInt = randomInt;

function randomInt(min, max) {
  return random.integer(min, max);
}

exports.randomArrItem = function(arr) {
  var idx = randomInt(0, arr.length - 1);
  return arr[idx];
};

exports.randomPastMoments = function() {
  // TODO
};

exports.randomCurrentMoments = function() {
  // TODO
};

exports.randomFutureMoments = function() {
  // TODO
};

exports.randomPastMoment = function() {
  return moment().
    subtract('y', randomInt(0, 2)).
    subtract('M', randomInt(0, 12)).
    subtract('d', randomInt(0, 30)).
    subtract('h', randomInt(1, 24));
};

exports.randomFutureMoment = function() {
  return moment().
    add('y', randomInt(0, 2)).
    add('M', randomInt(0, 12)).
    add('d', randomInt(0, 30)).
    add('h', randomInt(1, 24));
};

exports.randomEndMoment = function(startMoment) {
  return moment(startMoment).
    add('d', randomInt(0, 7)).
    add('h', randomInt(1, 24)).
    add('m', randomInt(0, 3) * 15);
};

// TODO Generate real random place in Kiev
exports.randomPlace = function() {
  return {
    name: 'Тараса Шевченка, Київ, місто Київ, Україна',
    latitude: 50.474155,
    longitude: 30.503491,
    placeId: 'ChIJWYvumA3O1EARPB_NTwi1nMs',
    city: 'Київ'
  };
};

exports.randomPrice = function() {
  var hasPrice = random.bool();
  return hasPrice ? randomInt(1, 1000) : 0;
};