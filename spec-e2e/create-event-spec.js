"use strict";
var conf = require('./protractor_conf').config;

describe('homepage', function () {
  var ptor;

  beforeEach(function () {
    browser.get(conf.baseUrl);
    ptor = protractor.getInstance();
    browser.get('/event/create');
  });

  it('should load the page', function () {
//    // test goes here

    browser.debugger();

    var eventName = by.binding('event.name');
    expect(ptor.isElementPresent(eventName)).toBe(true);
  });
});