const { DB, log } = require("./env");
const url = DB;

const initDB = async mongoose => {
  try {
    const db = await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    });
    log.debug("Successfully connected to the database");
  } catch (error) {
    log.debug("Error ", error);
  }
};

module.exports = {
  initDB
};
