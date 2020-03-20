const { isEqual } = require("lodash");
const Note = require("./note.model");

const findAllNote = async (req, res) => {
  try {
    const result = await Note.find({});
    res.json({ data: result });
  } catch (error) {
    res.status(500).json({
      message: "Error ",
      error
    });
  }
};

const findNoteBy = async (req, res) => {
  try {
    const result = await Note.find(req.query);
    res.json({ data: result });
  } catch (error) {
    res.status(500).json({
      message: "Error ",
      error
    });
  }
};

const createNote = async (req, res) => {
  try {
    const result = await new Note(req.body).save();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: "Error ",
      error
    });
  }
};

const updateNote = async (req, res) => {
  const data = await Note.findOneAndUpdate(
    req.query,
    { $set: req.body },
    { useFindAndModify: false }
  );
  res.json({ message: "Update", data });
};

const deleteNote = async (req, res) => {
  const success = { n: 1, ok: 1, deletedCount: 1 };
  const noData = { n: 0, ok: 1, deletedCount: 0 };
  try {
    const result = await Note.deleteOne(req.query).then(result => {
      if (isEqual(result, success)) {
        result = "Data deleted";
        res.json({ data: result });
      } else if (isEqual(result, noData)) {
        result = "Data not found!";
      } else {
        result = "internal Error!";
      }
      res.json({
        message: result
      });
    });
    res.json({ data: result });
  } catch (error) {
    res.status(500).json({
      message: "Error ",
      error
    });
  }
};

module.exports = {
  findAllNote,
  findNoteBy,
  createNote,
  updateNote,
  deleteNote
};
