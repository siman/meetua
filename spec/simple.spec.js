"use strict";

describe('homepage', function () {
  var ptor;

  beforeEach(function () {
    browser.get('http://127.0.0.1:3000/');
    ptor = protractor.getInstance();
    browser.get('/event/create');
    login();
  });

  function login() {
  }

  it('should load the page', function () {
//    // test goes here

    browser.debugger();

    var eventName = by.binding('event.name');
    expect(ptor.isElementPresent(eventName)).toBe(true);
  });
});