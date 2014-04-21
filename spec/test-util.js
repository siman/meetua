var mongoose = require('mongoose');

exports.reqUser = function(user) {
    return function(req, res, next) {
        req.user = user;
        next();
    }
};

exports.errorHandler = function(err, req, res, next) {
    console.error('Error ', err);
    next();
};

exports.mongoConnect = function(done) {
    console.log('Connecting ...');
    mongoose.connect('mongodb://localhost/testdb', function() {
        console.log('Connected');
        done();
    });
};

exports.mongoDisconnect = function(done) {
    console.log('Closing connection');
    mongoose.connection.close(function() {
        console.log('Connection is closed');
        done();
    });
};