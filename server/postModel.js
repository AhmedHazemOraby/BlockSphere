const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    user: { type: String, required: true },
    userPhoto: { type: String, default: "" }, // Store profile picture
    content: { type: String, required: true },
    image: { type: String, default: null },
    likes: [{ type: String }], // Store usernames of people who liked
    comments: [
      {
        user: String, // Store commenter name
        text: String, // Comment text
        createdAt: { type: Date, default: Date.now }
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Post", postSchema);