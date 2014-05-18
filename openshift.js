#!/bin/env node
//  OpenShift sample Node application
var express = require('express');
var fs      = require('fs');


/**
 *  Define the sample application.
 */
module.exports = function() {

    //  Scope.
    var self = this;


    self.isOpenShiftEnv = function() {
      return process.env.OPENSHIFT_NODEJS_IP;
    };

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupPortAndAddress = function(app) {
        app.set('port', process.env.OPENSHIFT_NODEJS_PORT || app.get('port'));
        app.set('ipaddress', process.env.OPENSHIFT_NODEJS_IP || app.get('ipaddress'));
        app.set('mongodb-url', (process.env.OPENSHIFT_MONGODB_DB_URL + process.env.OPENSHIFT_APP_NAME) || app.get('mongodb-url'));
    };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating sample app ...',
                       Date(Date.now()), sig);
           process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        if (self.isOpenShiftEnv()) {
          //  Process on exit and signals.
          process.on('exit', function() { self.terminator(); });

          // Removed 'SIGPIPE' from the list - bugz 852598.
          ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
           'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
          ].forEach(function(element, index, array) {
              process.on(element, function() { self.terminator(element); });
          });
        }
    };


    /**
     *  Initializes the sample application.
     */
    self.initialize = function(app) {
        self.setupPortAndAddress(app);
        self.setupTerminationHandlers();
    };

};