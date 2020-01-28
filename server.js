const http = require('http');
const {
  serveGuestPage,
  serveStaticPage,
  servePreviousGuestBook
} = require('./handlers');

const port = 8000;

const setPath = function(req) {
  let path = `${__dirname}/pages${req.url}`;
  if (path.includes('sources')) {
    path = `${__dirname}${req.url}`;
  }
  if (req.method === 'GET' && req.url === '/') {
    path = `${__dirname}/pages/home.html`;
  }
  return path;
};

const requestListener = function(req, res) {
  const path = setPath(req);
  if (req.method === 'POST') {
    return serveGuestPage(path, req, res);
  }
  if (req.method === 'GET' && path.includes('guestBook.html')) {
    return servePreviousGuestBook(path, req, res);
  }
  serveStaticPage(path, req, res);
};

const main = function() {
  const server = new http.Server(requestListener);
  server.listen(port);
};

main();
