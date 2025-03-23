const mongoose = require("mongoose");

// Check if model is already compiled
const User = mongoose.models.User || mongoose.model("User", new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  photoUrl: { type: String, default: "" },
  workplace: String,
  degrees: String,
  certifications: String,
  walletAddress: { type: String, unique: true, required: true }, // ✅ Ensure wallet is unique
}, { timestamps: true }));

module.exports = User;