'use strict';

var MAX_SIZE = 2*1024*1024; // 2MB
var path = require('path');
var os = require('os');
var config = require('../config/app-config');
var UPLOAD_DIR = config.UPLOAD_DIR;
var fs = require('fs-extra');

fs.mkdirp(UPLOAD_DIR, function(err) {
    if (err) throw err;
});

var formidable = require('formidable');
var _ = require('underscore');

exports.handleUpload = function(req, res, next) {

    var size = parseInt(req.headers['content-length'], 10);
    if (!size || size < 0) {
        res.send(JSON.stringify({error: "No size specified."}));
        return;
    }

    if (size > MAX_SIZE) {
        res.send(JSON.stringify({error: "Too big."}));
        return;
    }

    console.log('Uploading file ...');
    var form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.uploadDir = UPLOAD_DIR;
    form.parse(req, function(err, fields, files) {
        function extractFileResponseFields(file) {
            console.log('File uploaded: ', file);
            return {originalName: file.name, type: file.type, name: path.basename(file.path) }
        }
        if (err) return next(err);
        res.json(extractFileResponseFields(files.file));
    });

};
