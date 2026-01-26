const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema(
  {
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", required: true, index: true },
    title: { type: String, required: true },
    location: { type: String, default: "" },
    time: { type: String, default: "" },
    cost: { type: Number, default: 0 },
    notes: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Activity = mongoose.model("Activity", ActivitySchema);
module.exports = { Activity };

