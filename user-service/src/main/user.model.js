const mongoose = require("mongoose");
const moment = require("moment-timezone");

const UserSchema = mongoose.Schema({
  username: { type: String, unique: true, minlength: 10, maxlength: 20 },
  password: { type: String, minlength: 16, maxlength: 20 },
  phone: { type: String },
  lastActive: { type: String, default: null },
  createdAt: {
    type: String,
    default: moment(moment.utc(Date.now()).toDate())
      .local()
      .format("YYYY-MM-DD HH:mm:ss")
  },
  updateAt: { type: String, default: null }
});

module.exports = mongoose.model("User", UserSchema, "users");
