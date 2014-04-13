var MAX_SIZE = 2*1024*1024; // 2MB

module.exports = function(req, res) {
    console.log(req.headers);

    var size = parseInt(req.headers['content-length'], 10);
    if (!size || size < 0) {
        res.send(JSON.stringify({error: "No size specified."}));
        return;
    }

    if (size > MAX_SIZE) {
        res.send(JSON.stringify({error: "Too big."}));
        return;
    }

//    // files go in media/#number#/image.png
//    // thumbnails in media/#number#/#sizename#/image.png
//    var NUM_FILES = 1;
//    var fileNumber = NUM_FILES;
//    var dirPath = 'media/'+fileNumber+'/';
//    try {
//        fs.mkdirSync(dirPath, 0755); // sync!
//    } catch(e) {
//    }
//    var filePath = 'media/'+fileNumber+'/'+fileName;
//    var bytesUploaded = 0;
//    var file = fs.createWriteStream(filePath, {
//        flags: 'w',
//        encoding: 'binary',
//        mode: 0644
//    });
//
//    req.on('data', function(chunk) {
//        if (bytesUploaded+chunk.length > MAX_SIZE) {
//            file.end();
//            res.send(JSON.stringify({error: "Too big."}));
//            // TODO: remove the partial file.
//            return;
//        }
//        file.write(chunk);
//        bytesUploaded += chunk.length;
//
//        // TODO: measure elapsed time to help ward off attacks?
//
//        // deliberately take our time
//        req.pause();
//        setTimeout(function() {req.resume();}, PAUSE_TIME);
//    });
//
//    req.on('end', function() {
//        file.end();
//        processImage(fileNumber, fileName, function(err, data) {
//            console.log(err, data);
//            if (err) {
//                // bit of a hack sending the error straight to the client
//                res.send(JSON.stringify({error: err}));
//                // TODO: remove the file.
//                return;
//            }
//            res.send(JSON.stringify(data));
//        })
//    });
    res.send();
    // TODO
};