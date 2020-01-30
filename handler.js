const fs = require('fs');
const { App } = require('./appClass');
const CONTENT_TYPES = require('./lib/mimeTypes');
const statusCodes = { notFound: 404, redirect: 301 };

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

const serveStaticPage = function(req, res, next) {
  const path = setPath(req);
  const stat = fs.existsSync(path) && fs.statSync(path);
  if (!stat || !stat.isFile()) {
    return next();
  }
  const content = fs.readFileSync(path);
  const [, type] = path.split('.');
  responseWriting(content, type, res);
};

const responseWriting = function(content, type, res) {
  res.setHeader('Content-Type', CONTENT_TYPES[type]);
  res.setHeader('Content-Length', content.length);
  res.end(content);
};

const serveGuestBook = function(req, res, next) {
  const path = setPath(req);
  const stat = fs.existsSync(path) && fs.statSync(path);
  if (!stat || !stat.isFile()) {
    return next();
  }
  const [, type] = req.url.split('.');
  const content = provideCommentPage(path);
  responseWriting(content, type, res);
};

const storeInputs = function(body) {
  const comments = getJSONContent();
  comments.unshift(body);
  fs.writeFileSync('./comments.json', JSON.stringify(comments), 'utf8');
};

const parseChunk = function(chunk) {
  const data = {};
  const [name, comment] = chunk.split('&');
  [name, comment].forEach(element => {
    let [key, value] = element.split('=');
    key = key.replace(/\+/g, ' ');
    key = decodeURIComponent(key);
    value = value.replace(/\+/g, ' ');
    value = decodeURIComponent(value);
    data[key] = value;
  });
  data.date = new Date();
  return data;
};

const readBody = function(req, res, next) {
  let data = '';
  req.on('data', chunk => {
    data += chunk;
  });
  req.on('end', () => {
    req.body = data;
    next();
  });
};

const serveComments = function(req, res) {
  const chunk = parseChunk(req.body);
  storeInputs(chunk);
  res.setHeader('location', '/guestBook.html');
  res.writeHead(statusCodes.redirect);
  res.end();
};

const notFound = function(req, res) {
  res.writeHead(statusCodes.notFound);
  res.end('Not Found');
};

const app = new App();

app.use(readBody);

app.get('/guestBook.html', serveGuestBook);
app.get('', serveStaticPage);
app.post('/comments', serveComments);
app.get('', notFound);
app.post('', notFound);

// console.log(app);

module.exports = { app };
