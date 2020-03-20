const helmet = require("helmet");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { initDB } = require("./db");
const router = require("../main/user.routes");

// Setting up app
const app = express();
app.use(helmet());
app.use(bodyParser.json());

// Init DB
initDB(mongoose);

// Pet Routes
app.use("/", router);

module.exports = app;
