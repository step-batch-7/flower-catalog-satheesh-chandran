// const { readFileSync, writeFileSync, statSync, existsSync } = require('fs');
const http = require('http');
const port = 8000;

const { app } = require('./lib/handlers');

// const fileSystem = {
//   readFileSync: readFileSync,
//   writeFileSync: writeFileSync,
//   statSync: statSync,
//   existsSync: existsSync
// };

const main = function() {
  const server = new http.Server(app.serve.bind(app));
  server.listen(port);
};

main();
