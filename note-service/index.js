const app = require("./src/config/server");
const { PORT, NAME_SERVICE, log } = require("./src/config/env");

try {
  app.listen(PORT, () => {
    log.debug(`${NAME_SERVICE} is up !`);
  });
} catch (err) {
  log.debug(`${NAME_SERVICE} failed to start !`);
  throw err;
}
