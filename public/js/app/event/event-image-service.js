'use strict';

angular.module('myApp')
    .factory('eventImageService', function() {

        return {
            sayHello : function(name) {
                return "Hi " + name + "!";
            }
        }
    });