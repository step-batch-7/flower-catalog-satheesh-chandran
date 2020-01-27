const fs = require('fs');
const Response = require('./lib/response');
const CONTENT_TYPES = require('./lib/mimeTypes');

const provideNewResponse = function(content, type) {
  const res = new Response();
  res.setHeader('Content-Type', CONTENT_TYPES[type]);
  res.setHeader('Content-Length', content.length);
  res.statusCode = 200;
  res.body = content;
  return res;
};

const provideCommentPage = function(path) {
  let content = fs.readFileSync(path, 'utf8');
  const allComment = JSON.parse(fs.readFileSync('./inputs.json'));
  const fileDivision = allComment.reduce(getCommentDivisions, '');
  content = content.replace(/___comments___/g, fileDivision);
  return content;
};

const faviconResponse = function() {
  const res = new Response();
  res.statusCode = 200;
  res.body = '';
  return res;
};

const serveStaticPage = function(path, req) {
  const content = fs.readFileSync(path);
  const [, type] = req.url.split('.');
  return provideNewResponse(content, type);
};

const serveGuestPage = function(path, req) {
  const content = provideCommentPage(path);
  const [, type] = req.url.split('.');
  return provideNewResponse(content, type);
};

const servePages = function(req) {
  let path = `${__dirname}/pages${req.url}`;
  if (path.includes('sources')) {
    path = `${__dirname}${req.url}`;
  }
  let responseProvider = serveStaticPage;
  if (req.url === '/favicon.ico') {
    responseProvider = faviconResponse;
  }
  if (path.includes('guestBook.html')) {
    responseProvider = serveGuestPage;
  }
  return responseProvider(path, req);
};

const getCommentDivisions = function(content, reaction) {
  return (
    content +
    `<tr>
          <td>${reaction.date}</td>
          <td>${reaction.name}</td>
          <td>${reaction.comment}</td>
        </tr>`
  );
};

const storeInputs = function(body) {
  const contents = JSON.parse(fs.readFileSync('./inputs.json'));
  contents.unshift(body);
  fs.writeFileSync('./inputs.json', JSON.stringify(contents), 'utf8');
};

const parseRequestBody = function(req) {
  req.body.comment = req.body.comment.replace(/\+/g, ' ');
  req.body.comment = decodeURIComponent(req.body.comment);
  req.body.name = req.body.name.replace(/\+/g, ' ');
  req.body.name = decodeURIComponent(req.body.name);
  req.body.date = new Date().toJSON();
  storeInputs(req.body);
};

const findHandler = req => {
  if (req.method === 'GET' && req.url === '/') {
    req.url = '/home.html';
    return servePages;
  }
  if (req.method === 'POST') {
    parseRequestBody(req);
    return servePages;
  }
  return servePages;
};

const processRequest = req => {
  const handler = findHandler(req);
  return handler(req);
};

module.exports = { processRequest };
