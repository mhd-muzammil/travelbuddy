const mongoose = require("mongoose");

const AccommodationSchema = new mongoose.Schema(
  {
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", required: true, index: true },
    name: { type: String, required: true },
    address: { type: String, default: "" },
    checkInDate: { type: Date },
    checkOutDate: { type: Date },
    cost: { type: Number, default: 0 },
    notes: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Accommodation = mongoose.model("Accommodation", AccommodationSchema);
module.exports = { Accommodation };

