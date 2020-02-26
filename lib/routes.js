const express = require('express');
const app = express();

const { serveGuestBook, addComment } = require('./handlers');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get('/guestBook.html', serveGuestBook);
app.post('/comments', addComment);
app.use(express.static('public', { index: 'home.html' }));

module.exports = { app };
