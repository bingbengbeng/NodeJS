const controller = require("./notes.controller");
const { NAME_SERVICE_ALLIAS } = require("../config/env");
var express = require("express");
var router = express.Router();

// Default route
router.get("/", (req, res) => {
  res.send(
    `<p style='text-align:center;'>================= ${NAME_SERVICE_ALLIAS} is up !! =================</p>`
  );
});

//FIND
router.get("/note", controller.findNoteBy);
router.get("/note:id", controller.findNoteBy);

// CREATE
router.post("/note", controller.createNote);

// UPDATE
router.put("/note", controller.updateNote);

// DELETE
router.delete("/note", controller.deleteNote);
router.delete("/note:id", controller.deleteNote);

// LIST
router.get("/notes", controller.findAllNote);

module.exports = router;
