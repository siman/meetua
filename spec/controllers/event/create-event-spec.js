var createEvent = require('../../../controllers/event/create-event');
var fs = require('fs-extra');
var path = require('path');
var tmp = require('tmp');
var os = require('os');
tmp.setGracefulCleanup();

describe('create-event', function() {

    var imagePath = '';
    beforeEach(function(done){
        tmp.file(function(err, path, fd) {
            var content = new Buffer('content');
            imagePath = path;
            fs.writeSync(fd, content, 0, content.length, 0);
            done();
        });
    });
    describe('verifyAndCopyImage', function() {
        it('should move image to the new dir creating dest dir if necessary', function(done) {
            var img = {
                path: imagePath
            };
            var opts = { uploadDir: path.dirname(imagePath), eventImgDir: path.join(os.tmpDir(), 'event-imgs')};
            fs.removeSync(opts.eventImgDir);
            createEvent.verifyAndCopyImage(opts)(img, function(err, copiedImage) {
                if (err) done(err);
                expect(fs.existsSync(copiedImage.path)).toBe(true);
                expect(fs.existsSync(imagePath)).toBe(false);
                done();
            });
        });
        it('should preserve image properties', function(done) {
            var img = {
                path: imagePath,
                type: 'img/jpg'
            };
            var opts = { uploadDir: path.dirname(imagePath), eventImgDir: path.join(os.tmpDir(), 'event-imgs')};
            createEvent.verifyAndCopyImage(opts)(img, function(err, copiedImage) {
                if (err) done(err);
                expect(copiedImage.type).toBeDefined();
                done();
            });
        });
    });
});