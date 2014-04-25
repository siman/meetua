// We will pass these to the wrapper function at the end of the file
(function(isNode, isAngular) {

// This wrapper function returns the contents of your module,
// with dependencies
    var EventService = function() {
        this.createEvent = function() {
            return 'New event';
        };
    };

    if (isAngular) {
        // AngularJS module definition
        angular.module('myApp.shared', [])
            .service('eventService', EventService);
    } else if (isNode) {
        // NodeJS module definition
        module.exports = new EventService();
    }

})(typeof module !== 'undefined' && module.exports,
        typeof angular !== 'undefined');