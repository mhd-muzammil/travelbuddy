const mongoose = require("mongoose");

const MatchRequestSchema = new mongoose.Schema(
  {
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: { type: String, enum: ["pending", "accepted", "rejected", "cancelled"], default: "pending", index: true },
    matchScore: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

MatchRequestSchema.index({ fromUser: 1, toUser: 1 }, { unique: true });

const MatchRequest = mongoose.model("MatchRequest", MatchRequestSchema);
module.exports = { MatchRequest };

