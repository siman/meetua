'use strict';

var MAX_SIZE = 2*1024*1024; // 2MB
var MAX_SIZE_PRETTY = "2 mb"; // 2MB
var path = require('path');
var os = require('os');
var config = require('../config/app-config');
var UPLOAD_DIR = config.UPLOAD_DIR;
var fs = require('fs-extra');
var logger = require('./util/logger')('upload.js');

fs.mkdirp(UPLOAD_DIR, function(err) {
    if (err) throw err;
});

var formidable = require('formidable');
var _ = require('underscore');

// TODO DDOS protection
exports.handleUpload = function(req, res, next) {

    var size = parseInt(req.headers['content-length'], 10);
    if (!size || size < 0) {
        res.json(400, {error: "Размер файла не указан."});
        return;
    }

    if (size > MAX_SIZE) {
        res.json(400, {error: 'Слишком большой размер. Максимальный размер: ' + MAX_SIZE_PRETTY});
        return;
    }

    logger.debug('Uploading file ...');
    var form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.uploadDir = UPLOAD_DIR;
    form.parse(req, function(err, fields, files) {
        function extractFileResponseFields(file) {
            logger.debug('File uploaded: ', file);
            return {originalName: file.name, type: file.type, name: path.basename(file.path) }
        }
        if (err) return next(err);
        res.json(extractFileResponseFields(files.file));
    });

};
