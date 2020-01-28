const fs = require('fs');
const CONTENT_TYPES = require('./lib/mimeTypes');

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

const serveStaticPage = function(path, req, res) {
  const content = fs.readFileSync(path);
  const [, type] = path.split('.');
  responseWriting(content, type, res);
};

const responseWriting = function(content, type, res) {
  res.setHeader('Content-Type', CONTENT_TYPES[type]);
  res.setHeader('Content-Length', content.length);
  res.end(content);
};

const serveGuestPage = function(path, req, res) {
  const [, type] = req.url.split('.');
  req.setEncoding('utf8');
  req.on('data', chunk => {
    const data = parseChunk(chunk);
    storeInputs(data);
  });
  req.on('end', () => {
    const content = provideCommentPage(path);
    responseWriting(content, type, res);
  });
};

const servePreviousGuestBook = function(path, req, res) {
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

module.exports = { serveGuestPage, serveStaticPage, servePreviousGuestBook };
