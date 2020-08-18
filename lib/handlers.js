const fs = require('fs');

const convertToHTML = function (comments) {
  const lines = comments.map(({ name, comment, date }) => {
    const [dates, time] = new Date(date).toLocaleString().split(',');
    return `<tr>
        <td>${dates}</td><td>${time}</td><td>${name}</td><td>${comment}</td>
            </tr>`;
  });
  return lines.reverse().join('');
};

const serveGuestBook = function (req, res) {
  const db = req.app.locals.db;
  const path = `${__dirname}/../public/guestBook.html`;
  const content = fs.readFileSync(path, 'utf8');
  db.serialize(function () {
    db.all('select * from comments_log', (err, comm) => {
      if (err) {
        return process.stdout.write(err.message);
      }
      res.statusCode = 200;
      res.setHeader('Content-type', 'text/html');
      res.end(content.replace('___comments___', convertToHTML(comm)));
    });
  });
};

const addComment = function (req, res) {
  const db = req.app.locals.db;
  db.serialize(function () {
    const obj = db.prepare('insert into comments_log values (?, ?, ?)');
    obj.run(req.body.name, req.body.comment, new Date());
    obj.finalize();
  });
  res.redirect('/guestBook.html');
};

module.exports = { serveGuestBook, addComment };
