const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: { type: String, required: true },   
    receiver: { type: String, required: true }, 
    type: {
      type: String,
      enum: ["text", "file"],
      default: "text",
    },
    content: { type: String, required: true }, 
    seen: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);