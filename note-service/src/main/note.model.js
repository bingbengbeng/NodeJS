const mongoose = require("mongoose");
const NoteSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"]
    },
    description: { type: String, required: true }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Note", NoteSchema, "notes");
