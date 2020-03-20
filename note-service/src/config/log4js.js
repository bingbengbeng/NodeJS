const log4js = require("log4js");
const { isEqual } = require("lodash");
const NODE_ENV = process.env.NODE_ENV.trim();

let log4jsConfigure = {
  appenders: {
    out: {
      type: "console",
      layout: {
        type: "pattern",
        pattern: "%r{dd-MM-yyyy} %r %[%-5p%] [%z] %c (%f{1}:%l) - %m%n"
      }
    },
    app: {
      type: "file",
      filename: "logs/site.log",
      maxLogSize: 10485760,
      backups: 3,
      compress: true,
      layout: {
        type: "pattern",
        pattern: "[%d{dd-MM-yyyy} %r %-5p [%z] (%f:%l) - %m%n"
      }
    }
  },
  categories: {
    default: {
      appenders: ["out", "app"],
      level: "debug",
      enableCallStack: true
    }
  }
};

if (isEqual(NODE_ENV, "DEV"))
  log4jsConfigure.categories.default.appenders = ["out"];

log4js.configure(log4jsConfigure);

const log = log4js.getLogger();

module.exports = log;
