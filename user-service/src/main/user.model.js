const mongoose = require("mongoose");
const UserSchema = mongoose.Schema(
  {
    username: { type: String },
    password: { type: String },
    phone: { type: String },
    lastActive: { type: String, default: null }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", UserSchema, "users");
