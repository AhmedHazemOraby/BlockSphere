const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user: { type: String, required: true }, // The user's email or ID
  content: { type: String, required: true }, // The post content
  image: String, // Optional image URL
  createdAt: { type: Date, default: Date.now }, // Timestamp of post creation
});

module.exports = mongoose.model('Post', postSchema);