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

const getCommentDivisions = function(content, reaction) {
  const [date, time] = new Date(reaction.date).toLocaleString().split(',');
  return (
    content +
    `<tr>
          <td> ${date} </td>
          <td> ${time} </td>
          <td> ${reaction.name} </td>
          <td> ${reaction.comment} </td>
        </tr>`
  );
};

const getJSONContent = function() {
  if (!fs.existsSync('./comments.json')) {
    return [];
  }
  let comments = fs.readFileSync('./comments.json', 'utf8');
  if (comments === '') {
    return [];
  }
  comments = JSON.parse(comments);
  return comments;
};

const provideCommentPage = function(path) {
  let content = fs.readFileSync(path, 'utf8');
  const allComment = getJSONContent();
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

const storeInputs = function(body) {
  const comments = getJSONContent();
  comments.unshift(body);
  fs.writeFileSync('./comments.json', JSON.stringify(comments), 'utf8');
};

const parseRequestBody = function(req) {
  req.body.comment = req.body.comment.replace(/\+/g, ' ');
  req.body.comment = decodeURIComponent(req.body.comment);
  req.body.name = req.body.name.replace(/\+/g, ' ');
  req.body.name = decodeURIComponent(req.body.name);
  const now = new Date();
  req.body.date = now;
  storeInputs(req.body);
};

const findHandler = req => {
  if (req.method === 'GET' && req.url === '/') {
    req.url = '/home.html';
  }
  if (req.method === 'POST') {
    parseRequestBody(req);
  }
  return servePages;
};

const processRequest = req => {
  const handler = findHandler(req);
  return handler(req);
};

module.exports = { processRequest };
