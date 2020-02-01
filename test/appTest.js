const request = require('supertest');
const sinon = require('sinon');
const fs = require('fs');
const { app } = require('../lib/handlers');

const STATUS_CODES = { OK: 200, METHOD_NOT_FOUND: 400, REDIRECT: 301 };

describe('GET request for static files', function() {
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

  it('should give the ageratum page with url /ageratum.html', function(done) {
    request(app.serve.bind(app))
      .get('/ageratum.html')
      .expect('Content-Type', 'text/html')
      .expect(/<strong> Ageratum, /)
      .expect(STATUS_CODES.OK, done);
  });

  it('should give the abeliophyllum page for url /abeliophyllum.html', done => {
    request(app.serve.bind(app))
      .get('/abeliophyllum.html')
      .expect('Content-Type', 'text/html')
      .expect(/<strong>Abeliophyllum distichum <\/strong>/)
      .expect(STATUS_CODES.OK, done);
  });

  it('should give the css content with url /css/styles.css', function(done) {
    request(app.serve.bind(app))
      .get('/css/styles.css')
      .expect('Content-Type', 'text/css')
      .expect(STATUS_CODES.OK, done);
  });

  it('should give the jpg content with url /jpg/freshorigins.jpg', done => {
    request(app.serve.bind(app))
      .get('/jpg/freshorigins.jpg')
      .expect('Content-Type', 'image/jpeg')
      .expect(STATUS_CODES.OK, done);
  });

  it('should give the pdf file when the request is for pdf file', done => {
    request(app.serve.bind(app))
      .get('/pdf/Ageratum.pdf')
      .expect('Content-Type', 'application/pdf')
      .expect(STATUS_CODES.OK, done);
  });

  it('should give the notFound page for non existing page GET', done => {
    request(app.serve.bind(app))
      .get('/jahfdkjndfkj')
      .expect('Content-Type', 'text/html')
      .expect(/404 File Not Found/)
      .expect(STATUS_CODES.OK, done);
  });
});

describe('GET guestBook.html', function() {
  it('should give the guest book page for /guestBook.html', done => {
    request(app.serve.bind(app))
      .get('/guestBook.html')
      .expect('Content-Type', 'text/html')
      .expect(STATUS_CODES.OK, done);
  });
  after(() => sinon.restore());
});

describe('redirection for commnent POST', function() {
  before(() => sinon.replace(fs, 'writeFileSync', () => {}));
  it('should redirect to guest page for POST /comments', done => {
    request(app.serve.bind(app))
      .post('/comments')
      .send('name=satheesh&comment=hai+satheesh')
      .expect('Location', '/guestBook.html')
      .expect(STATUS_CODES.REDIRECT, done);
  });
  after(() => sinon.restore());
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

describe('test of some function', function() {});
