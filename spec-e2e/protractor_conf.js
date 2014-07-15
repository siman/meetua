"use strict";

var baseUrl = 'http://127.0.0.1:3000';
var mockUsers = require('../app/controllers/user-mock-store');

// An example configuration file.
exports.config = {
  // Do not start a Selenium Standalone sever - only run this using chrome.
  //  chromeOnly: true,
  //  chromeDriver: './node_modules/protractor/selenium/chromedriver',
  seleniumAddress: 'http://0.0.0.0:4444/wd/hub',
  baseUrl: baseUrl,

  // Capabilities to be passed to the webdriver instance.
  capabilities: { 'browserName': 'chrome' },

  // Spec patterns are relative to the current working directly when
  // protractor is called.
  specs: ['*spec.js'],

  // Options to be passed to Jasmine-node.
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000
  },

  onPrepare: function() {

    var loginUser = mockUsers[0];
    browser.driver.get(baseUrl + '/login');

    browser.driver.findElement(by.id('email')).sendKeys(loginUser.email);
    browser.driver.findElement(by.id('password')).sendKeys(loginUser.password);
    browser.driver.findElement(by.xpath("//node()[@type='submit']")).click();

    // Login takes some time, so wait until it's done.
    // For the test app's login, we know it's done when it redirects to
    // home page.
    browser.driver.wait(function() {
      return browser.driver.getCurrentUrl().then(function(url) {
        return new RegExp(baseUrl).test(url);
      });
    });
  }
};
