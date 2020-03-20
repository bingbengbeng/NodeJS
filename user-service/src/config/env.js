const { isEqual } = require("lodash");
const log = require("./log4js");
const NODE_ENV = process.env.NODE_ENV.trim();
const moment = require("moment-timezone");

if (isEqual(NODE_ENV, "DEV")) require("dotenv").config();

const DB = process.env.DB;
const USER_DB = process.env.USER_DB;
const PASS_DB = process.env.PASS_DB;

const PORT = process.env.PORT;
const NAME_SERVICE = process.env.NAME_SERVICE;
const NAME_SERVICE_ALLIAS = process.env.NAME_SERVICE_ALLIAS;

module.exports = {
  log,
  DB,
  USER_DB,
  PASS_DB,
  PORT,
  NAME_SERVICE,
  NAME_SERVICE_ALLIAS
};
