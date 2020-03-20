const controller = require("./user.controller");
const { NAME_SERVICE_ALLIAS } = require("../config/env");
var express = require("express");
const { check, validationResult } = require("express-validator");
var router = express.Router();

// Default route
router.get("/", (req, res) => {
  res.send(
    `<p style='text-align:center;'>================= ${NAME_SERVICE_ALLIAS} is up !! =================</p>`
  );
});

//FIND
router.get("/user/", controller.findUserBy);
router.get("/user/:id", controller.findUserBy);

// CREATE
router.post("/user/", [check("username").isString()], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  controller.createUser(req, res);
});

// UPDATE
router.put("/user/", controller.updateUser);

// DELETE
router.delete("/user/", controller.deleteUser);
router.delete("/user/:id", controller.deleteUser);

// LIST
router.get("/users/", controller.findAllUser);

// LOGIN
router.post("/login", controller.login);

// LOGOUT
router.post("/logout", controller.logout);

module.exports = router;
