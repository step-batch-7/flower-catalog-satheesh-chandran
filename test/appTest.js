const request = require('supertest');
const sinon = require('sinon');
const fs = require('fs');
const { app } = require('../lib/routes');

const STATUS_CODES = {
  OK: 200,
  METHOD_NOT_FOUND: 400,
  REDIRECT: 301,
  NOT_FOUND: 404,
};

describe('GET request for static files', function () {
  it('should give the home page with url /', function (done) {
    request(app)
      .get('/')
      .expect('Content-Type', /html/)
      .expect(/const hideImage = function()/)
      .expect(STATUS_CODES.OK, done);
  });

  it('should give the home page with url /home.html', function (done) {
    request(app)
      .get('/home.html')
      .expect('Content-Type', /html/)
      .expect(/const hideImage = function()/)
      .expect(STATUS_CODES.OK, done);
  });

  it('should give the ageratum page with url /ageratum.html', function (done) {
    request(app)
      .get('/ageratum.html')
      .expect('Content-Type', /html/)
      .expect(/<strong> Ageratum, /)
      .expect(STATUS_CODES.OK, done);
  });

  it('should give the abeliophyllum page for url /abeliophyllum.html', done => {
    request(app)
      .get('/abeliophyllum.html')
      .expect('Content-Type', /html/)
      .expect(/<strong>Abeliophyllum distichum <\/strong>/)
      .expect(STATUS_CODES.OK, done);
  });

  it('should give the css content with url /css/styles.css', function (done) {
    request(app)
      .get('/css/styles.css')
      .expect('Content-Type', /css/)
      .expect(STATUS_CODES.OK, done);
  });

  it('should give the jpg content with url /jpg/freshorigins.jpg', done => {
    request(app)
      .get('/jpg/freshorigins.jpg')
      .expect('Content-Type', 'image/jpeg')
      .expect(STATUS_CODES.OK, done);
  });

  it('should give the pdf file when the request is for pdf file', done => {
    request(app)
      .get('/pdf/Ageratum.pdf')
      .expect('Content-Type', 'application/pdf')
      .expect(STATUS_CODES.OK, done);
  });

  it('should give the notFound page for non existing page GET', done => {
    request(app)
      .get('/jahfdkjndfkj')
      .expect('Content-Type', /html/)
      .expect(STATUS_CODES.NOT_FOUND, done);
  });
});

describe('Not Allowed Method', () => {
  it('should give 400 status code when the method is not allowed', done => {
    request(app)
      .put('/guestBook.html')
      .expect('Content-Type', /html/)
      .expect(STATUS_CODES.NOT_FOUND, done);
  });
});

