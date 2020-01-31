const request = require('supertest');
const { app } = require('../lib/handlers');
const STATUS_CODES = { OK: 200, METHOD_NOT_FOUND: 400 };

describe('GET request for home page', function() {
  it('should give the home page with url /', function(done) {
    request(app.serve.bind(app))
      .get('/')
      .expect('Content-Type', 'text/html')
      .expect(/const hideImage = function()/)
      .expect(STATUS_CODES.OK, done);
  });

  it('should give the home page with url /home.html', function(done) {
    request(app.serve.bind(app))
      .get('/home.html')
      .expect('Content-Type', 'text/html')
      .expect(/const hideImage = function()/)
      .expect(STATUS_CODES.OK, done);
  });
});

describe('GET request for agetatum page', function() {
  it('should give the ageratum page with url /ageratum.html', function(done) {
    request(app.serve.bind(app))
      .get('/ageratum.html')
      .expect('Content-Type', 'text/html')
      .expect(/<strong> Ageratum, /)
      .expect(STATUS_CODES.OK, done);
  });
});

describe('GET request for abeliophyllum page', function() {
  it('should give the abeliophyllum page with url /abeliophyllum.html', function(done) {
    request(app.serve.bind(app))
      .get('/abeliophyllum.html')
      .expect('Content-Type', 'text/html')
      .expect(/<strong>Abeliophyllum distichum <\/strong>/)
      .expect(STATUS_CODES.OK, done);
  });
});

describe('GET request for css files', function() {
  it('should give the css content with url /css/styles.css', function(done) {
    request(app.serve.bind(app))
      .get('/css/styles.css')
      .expect('Content-Type', 'text/css')
      .expect(STATUS_CODES.OK, done);
  });
});

describe('GET request for jpg files', function() {
  it('should give the jpg content with url /jpg/freshorigins.jpg', function(done) {
    request(app.serve.bind(app))
      .get('/jpg/freshorigins.jpg')
      .expect('Content-Type', 'image/jpeg')
      .expect(STATUS_CODES.OK, done);
  });
});

describe('redirection for commnent POST', function() {
  it('should redirect to guest page if the requested with POST for comments', function(done) {
    request(app.serve.bind(app))
      .get('/comments')
      .expect('Content-Type', 'text/html')
      .expect(200, done);
  });
});

describe('Not Allowed Method', () => {
  it('should give 400 status code when the method is not allowed', done => {
    request(app.serve.bind(app))
      .put('/guestBook.html')
      .expect('Content-Type', 'text/plain')
      .expect('Method Not Allowed')
      .expect(STATUS_CODES.METHOD_NOT_FOUND, done);
  });
});

describe('test of some function', function() {
  it('should give the pdf file when the request is for pdf file', done => {
    request(app.serve.bind(app))
      .get('/pdf/Ageratum.pdf')
      .expect('Content-Type', 'application/pdf')
      .expect(STATUS_CODES.OK, done);
  });
});
