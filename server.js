const { env } = process;

const port = 8000;
const PORT = env.PORT || port;
const { app } = require('./lib/routes');

const main = function() {
  app.listen(PORT, () => process.stdout.write(`Listening at ${PORT}`));
};

main();
