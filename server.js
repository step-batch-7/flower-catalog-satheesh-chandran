const http = require('http');
const port = 8000;

const { app } = require('./handler');

const main = function() {
  const server = new http.Server(app.serve.bind(app));
  server.listen(port);
};

main();

// const {
//   serveGuestPage,
//   serveStaticPage,
//   servePreviousGuestBook
// } = require('./handlers');

// const setPath = function(req) {
//   let path = `${__dirname}/public${req.url}`;
//   if (req.method === 'GET' && req.url === '/') {
//     path = `${__dirname}/public/home.html`;
//   }
//   return path;
// };

// const requestListener = function(req, res) {
//   const path = setPath(req);
//   if (req.method === 'POST') {
//     return serveGuestPage(path, req, res);
//   }
//   if (req.method === 'GET' && path.includes('guestBook.html')) {
//     return servePreviousGuestBook(path, req, res);
//   }
//   if (req.method === 'GET' && req.url === '/comments')
//     return serveRedirection(path, req, res);
//   serveStaticPage(path, req, res);
// };

// const main = function() {
//   const server = new http.Server(requestListener);
//   server.listen(port);
// };

// main();
