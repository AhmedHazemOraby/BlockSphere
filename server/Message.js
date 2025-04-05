const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: { type: String, required: true },   // Email of sender
    receiver: { type: String, required: true }, // Email of receiver
    type: {
      type: String,
      enum: ["text", "file"],
      default: "text",
    },
    content: { type: String, required: true }, // ✅ Must be 'content'
    seen: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);