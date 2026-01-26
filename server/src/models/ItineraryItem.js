const mongoose = require("mongoose");

const ItineraryItemSchema = new mongoose.Schema(
  {
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", required: true, index: true },
    dayNumber: { type: Number, required: true, index: true },
    time: { type: String, default: "" },
    title: { type: String, required: true },
    location: { type: String, default: "" },
    notes: { type: String, default: "" },
    estimatedCost: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

ItineraryItemSchema.index({ tripId: 1, dayNumber: 1 });

const ItineraryItem = mongoose.model("ItineraryItem", ItineraryItemSchema);
module.exports = { ItineraryItem };

