const mongoose = require("mongoose");

const User = mongoose.models.User || mongoose.model("User", new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  photoUrl: { type: String, default: "" },
  connections: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  degrees: String,
  certifications: String,
  walletAddress: { type: String, required: true },
  education: [{
    title: String,
    description: String,
    year: String,
  }],
  
  jobExperiences: [{
    title: String,
    description: String,
    year: String,
  }],
  
  internships: [{
    title: String,
    description: String,
    year: String,
  }],      
  
}, { timestamps: true }));

module.exports = User;