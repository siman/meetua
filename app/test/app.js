var request = require('supertest');
var app = require('../../app.js');

describe('GET /', function() {
  it('should return 200 OK', function(done) {
    request(app)
      .get('/')
      .expect(200, done);
  });
});

describe('GET /signup', function() {
  it('should return 200 OK', function(done) {
    request(app)
      .get('/signup')
      .expect(200, done);
  });
});

describe('GET /api', function() {
  it('should return 200 OK', function(done) {
    request(app)
      .get('/api')
      .expect(200, done);
  });
});

describe('GET /contact', function() {
  it('should return 200 OK', function(done) {
    request(app)
      .get('/contact')
      .expect(200, done);
  });
});