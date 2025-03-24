const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
  certificateUrl: { type: String, required: true },
  description: { type: String, required: true },
  status: {
    type: String,
    enum: ["unpaid", "pending", "verified", "declined"],
    default: "unpaid",
  },
  transactionHash: { type: String, default: "" },
  contractId: { type: Number, required: false }, 
}, { timestamps: true });

const Certificate = mongoose.model("Certificate", certificateSchema);

module.exports = Certificate;