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
    console.log('Upload image to ', wstream.path);
    req.pipe(wstream);
    req.on('data', function(d) {
        console.log('Write bytes ', d.length);
    });
    req.on('end', function(){
        console.log('File upload complete');
        wstream.end();
    });

    res.send(wstream.path);
};