const mongoose = require("mongoose");
const PassportSchema = mongoose.Schema({
  data: { type: String, required: true }
});

module.exports = mongoose.model("Passport", PassportSchema, "passports");
