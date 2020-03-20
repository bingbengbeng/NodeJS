const mongoose = require("mongoose");
const PassportSchema = mongoose.Schema({
  data: { type: String, required: true },
  expiredDate: { type: String, default: null }
});

module.exports = mongoose.model("Passport", PassportSchema, "passports");
