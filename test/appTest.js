const request = require('supertest');
const { app } = require('../lib/handlers');

describe('GET / home page', function() {
  it('should give the home page with url /', function(done) {
    request(app.serve.bind(app))
      .get('/')
      .expect('Content-Type', 'text/html')
      .expect(200, done);
  });
});
