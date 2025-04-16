const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    user: { type: String, required: true },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "userRole",
    },

    userRole: {
      type: String,
      enum: ["User", "Organization"],
      required: true,
    },
    
    userPhoto: { type: String, default: "" },

    content: { type: String, required: true },
    image: { type: String, default: null },

    likes: [{ type: String }],

    comments: [
      {
        user: String,
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        text: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Post", postSchema);