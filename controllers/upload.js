var MAX_SIZE = 2*1024*1024; // 2MB

var temp = require('temp').track();
var fs = require('fs');
var os = require('os');

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

    var wstream = temp.createWriteStream();
    console.log('stream ', wstream.path);
    wstream.on('pipe', function(src){
        console.log('Sending file content to temp stream');
    });
    req.pipe(wstream);
    wstream.end();

    res.send(wstream.path);
};