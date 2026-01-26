const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, index: true },
    username: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    avatarUrl: { type: String, default: "" },

    age: { type: Number },
    gender: { type: String },
    phone: { type: String },
    bio: { type: String },
    languages: { type: [String], default: [], index: true },
    location: {
      city: { type: String, default: "" },
      country: { type: String, default: "" },
    },
    travelStyle: {
      type: String,
      enum: ["budget", "backpacking", "standard", "luxury"],
      default: "budget",
      index: true,
    },
    interests: { type: [String], default: [], index: true },
    preferredDestinations: { type: [String], default: [], index: true },
    preferredTripDuration: { type: String },
    budgetRange: {
      min: { type: Number },
      max: { type: Number },
    },
    privacy: {
      showEmail: { type: Boolean, default: false },
      showPhone: { type: Boolean, default: false },
    },
    socialLinks: {
      instagram: String,
      twitter: String,
      linkedin: String,
      website: String,
    },
    blockedUsers: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    ],
    
    isIdentityVerified: { type: Boolean, default: false },
    identityStatus: {
      type: String,
      enum: ["idle", "pending", "verified", "rejected"],
      default: "idle",
    },
    identityDoc: { type: String, default: "" }, // URL to uploaded ID or Social Link
    // ----------------------------------------------------
  },
  { timestamps: true },
);

UserSchema.index({ "location.city": 1, "location.country": 1 });

const User = mongoose.model("User", UserSchema);

module.exports = { User };

