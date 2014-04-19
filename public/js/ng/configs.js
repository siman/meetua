angular.module('myApp.configs', [])
    .constant('KIEV_MAP', {
        center: {
            latitude: 50.440646,
            longitude: 30.521018
        },
        zoom: 11
    })
    .constant('BASE_MAP', {
        draggable: true,
        zoom: 16,
        opts: {
            scrollwheel: false
        }
    });