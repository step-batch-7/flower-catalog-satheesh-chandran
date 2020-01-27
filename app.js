const fs = require('fs');
const Response = require('./lib/response');
const CONTENT_TYPES = require('./lib/mimeTypes');

const provideNewResponse = function(req, content, type) {
  const res = new Response();
  if (!req.headers['Cookie'])
    res.setHeader('Set-Cookie', `sessionId=${new Date().getTime()}`);
  res.setHeader('Content-Type', CONTENT_TYPES[type]);
  res.setHeader('Content-Length', content.length);
  res.statusCode = 200;
  res.body = content;
  return res;
};

const serveHomePage = req => {
  let path = `${__dirname}/pages${req.url}`;
  if (path.includes('sources')) path = `${__dirname}${req.url}`;
  if (req.url == '/favicon.ico') {
    const res = new Response();
    res.statusCode = 200;
    res.body = '';
    return res;
  }
  let content = fs.readFileSync(path);
  if (path.includes('guestBook.html')) {
    content = fs.readFileSync(path, 'utf8');
    const allComment = JSON.parse(fs.readFileSync('./inputs.json')).reverse();
    const fileDivision = allComment.reduce(getCommentDivisions, '');
    content = content.replace(/___comments___/g, fileDivision);
  }
  const [, type] = req.url.split('.');
  return provideNewResponse(req, content, type);
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
  contents.push(body);
  fs.writeFileSync('./inputs.json', JSON.stringify(contents), 'utf8');
};

const findHandler = req => {
  if (req.method === 'GET' && req.url === '/') {
    req.url = '/home.html';
    return serveHomePage;
  }
  if (req.method === 'GET') return serveHomePage;
  if (req.method === 'POST') {
    req.body.comment = req.body.comment.replace(/\+/g, ' ');
    req.body.date = new Date().toJSON();
    storeInputs(req.body);
    return serveHomePage;
  }
  return () => new Response();
};

const processRequest = req => {
  const handler = findHandler(req);
  return handler(req);
};

module.exports = { processRequest };
