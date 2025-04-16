const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  photoUrl: { type: String },
  walletAddress: { type: String, unique: true, required: true },
  organizationType: { type: String, enum: ["Business", "Education", "Other"], required: true },
  establishedSince: Date,
  numWorkers: Number,
  accolades: [
    {
      title: String,
      description: String,
      year: String,
      photoUrl: String,
    }
  ],
}, { timestamps: true });

module.exports = mongoose.model("Organization", organizationSchema);