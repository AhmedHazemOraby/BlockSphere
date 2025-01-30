const mongoose = require("mongoose");

// Check if model is already compiled
const User = mongoose.models.User || mongoose.model("User", new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  photoUrl: { type: String, default: "" }, // Stores profile picture
  workplace: String,
  degrees: String,
  certifications: String,
  walletAddress: String,
}, { timestamps: true }));

module.exports = User;