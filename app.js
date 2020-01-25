const fs = require('fs');
const Response = require('./lib/response');
const CONTENT_TYPES = require('./lib/mimeTypes');

const serveHomePage = req => {
  let path = `${__dirname}/pages${req.url}`;
  if (path.includes('sources')) path = `${__dirname}${req.url}`;
  if (req.url == '/favicon.ico') {
    const res = new Response();
    res.statusCode = 200;
    res.body = '';
    return res;
  }
  const content = fs.readFileSync(path);
  const [, type] = req.url.split('.');
  const res = new Response();
  if (!req.headers['Cookie'])
    res.setHeader('Set-Cookie', `sessionId=${new Date().getTime()}`);
  res.setHeader('Content-Type', CONTENT_TYPES[type]);
  res.setHeader('Content-Length', content.length);
  res.statusCode = 200;
  res.body = content;
  return res;
};

const findHandler = req => {
  if (req.method === 'GET' && req.url === '/') {
    req.url = '/home.html';
    return serveHomePage;
  }
  if (req.method === 'GET') return serveHomePage;
  return () => new Response();
};

const processRequest = req => {
  const handler = findHandler(req);
  return handler(req);
};

module.exports = { processRequest };
