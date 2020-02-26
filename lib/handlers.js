const fs = require('fs');
const { env } = require('process');

const { getDataStorePath } = require('../config');
const { Comment, Comments } = require('./comments');

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

module.exports = { serveGuestBook, addComment };
