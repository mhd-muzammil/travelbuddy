const mongoose = require("mongoose");

const TripSchema = new mongoose.Schema(
  {
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    destination: { type: String, required: true, index: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    budget: { type: Number, default: 0 },
    tripType: { type: String, enum: ["solo", "group", "friends", "backpack"], default: "group", index: true },
    maxMembers: { type: Number, default: 4 },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", index: true }],
    invitees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    joinRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    description: { type: String, default: "" },
    tags: { type: [String], default: [], index: true },
    isPublicShareEnabled: { type: Boolean, default: false },
    publicShareSlug: { type: String, unique: true, sparse: true, index: true },
    note: { type: String, default: "" }, // shared notes/checklist simplified
    gallery: { type: [String], default: [] }, // array of image URLs
  },
  { timestamps: true }
);

TripSchema.index({ destination: "text", description: "text", tags: "text" });

const Trip = mongoose.model("Trip", TripSchema);
module.exports = { Trip };

