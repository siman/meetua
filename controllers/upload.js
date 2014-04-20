var MAX_SIZE = 2*1024*1024; // 2MB
var path = require('path');
var os = require('os');
var UPLOAD_DIR = path.join(os.tmpdir(), 'upload')
var mkdirp = require('mkdirp');

mkdirp(UPLOAD_DIR, function(err) {
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
            return {name: file.name, type: file.type, path: file.path }
        }
        if (err) return next(err);
        res.json(extractFileResponseFields(files.file));
    });

};

exports.UPLOAD_DIR = UPLOAD_DIR;