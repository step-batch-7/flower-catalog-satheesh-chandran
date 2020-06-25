const sqlite = require('sqlite3');
const { readFileSync } = require('fs');

const { env } = process;

const port = 8000;
const PORT = env.PORT || port;
const { app } = require('./lib/routes');

const main = function () {
  const schema = readFileSync('./schema.sql', 'utf8');
  const db = new sqlite.Database('data/comments.db');
  db.run(schema);
  app.locals.db = db;
  app.listen(PORT, () => process.stdout.write(`Listening at ${PORT}`));
};

main();
