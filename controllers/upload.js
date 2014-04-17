var MAX_SIZE = 2*1024*1024; // 2MB

var formidable = require('formidable');

module.exports = function(req, res, next) {

    var size = parseInt(req.headers['content-length'], 10);
    if (!size || size < 0) {
        res.send(JSON.stringify({error: "No size specified."}));
        return;
    }

    if (size > MAX_SIZE) {
        res.send(JSON.stringify({error: "Too big."}));
        return;
    }

    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        res.json({files: files});
    });

};