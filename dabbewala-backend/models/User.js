const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["consumer", "provider"], default: "consumer" }
});

module.exports = mongoose.model("User", userSchema);