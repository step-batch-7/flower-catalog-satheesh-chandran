const fs = require('fs');
const querystring = require('querystring');
const { env } = require('process');

const { getDataStorePath } = require('../config');
const { App } = require('./app');
const { Comment, Comments } = require('./comments');

const CONTENT_TYPES = require('./mimeTypes');
const STATUS_CODE = { NOT_FOUND: 404, REDIRECT: 301, METHOD_NOT_ALLOWED: 400 };
const COMMENT_STORE = getDataStorePath(env);

/////////////////////////////////////////////////
const loadComments = function() {
  if (!fs.existsSync(COMMENT_STORE)) {
    return '[]';
  }
  const contents = fs.readFileSync(COMMENT_STORE, 'utf8');
  if (contents === '') {
    return '[]';
  }
  return contents;
};
const comments = Comments.load(loadComments());
/////////////////////////////////////////////////

const setPath = function(req) {
  let path = `${__dirname}/../public${req.url}`;
  if (req.url === '/') {
    path = `${__dirname}/../public/home.html`;
  }
  return path;
};

const serveStaticPage = function(req, res, next) {
  const path = setPath(req);
  const stat = fs.existsSync(path) && fs.statSync(path);
  if (!stat || !stat.isFile()) {
    return next();
  }
  const content = fs.readFileSync(path);
  const type = path.split('.').pop();
  res.setHeader('Content-Type', CONTENT_TYPES[type]);
  res.setHeader('Content-Length', content.length);
  res.end(content);
};

const serveGuestBook = function(req, res) {
  const content = fs.readFileSync(
    `${__dirname}/../public/guestBook.html`,
    'utf8'
  );
  res.statusCode = 200;
  res.setHeader('Content-type', 'text/html');
  res.end(content.replace('___comments___', comments.toHTML()));
};

const addComment = function(req, res) {
  const comment = new Comment(req.body.name, req.body.comment, new Date());
  comments.addComment(comment);
  fs.writeFileSync(COMMENT_STORE, comments.toJSON());
  res.writeHead(STATUS_CODE.REDIRECT, {
    Location: '/guestBook.html'
  });
  res.end();
};

const readBody = function(req, res, next) {
  let data = '';
  req.on('data', chunk => {
    data += chunk;
  });
  req.on('end', () => {
    req.body = querystring.parse(data);
    next();
  });
};

const notFound = function(req, res) {
  const type = 'html';
  const content = fs.readFileSync(
    '/Users/step13/html/flower-catalog-satheesh-chandran/public/notFound.html'
  );
  res.setHeader('Content-Type', CONTENT_TYPES[type]);
  res.setHeader('Content-Length', content.length);
  res.end(content);
};

const methodNotAllowed = function(req, res) {
  res.setHeader('Content-Type', 'text/plain');
  res.writeHead(STATUS_CODE.METHOD_NOT_ALLOWED);
  res.end('Method Not Allowed');
};

const app = new App();

app.use(readBody);

app.get('/guestBook.html', serveGuestBook);
app.get('', serveStaticPage);
app.post('/comments', addComment);
app.get('', notFound);
app.post('', notFound);
app.use(methodNotAllowed);

// console.log(app);

module.exports = { app, loadComments };
