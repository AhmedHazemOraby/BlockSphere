const mongoose = require("mongoose");

const degreeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
  degreeUrl: { type: String, required: true },
  description: { type: String, required: true },
  status: {
    type: String,
    enum: ["unpaid", "pending", "verified", "declined"],
    default: "unpaid",
  },
  transactionHash: { type: String },
  contractId: { type: Number },
}, { timestamps: true });

module.exports = mongoose.model("degree", degreeSchema);