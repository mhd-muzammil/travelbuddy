const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: "Trip" },
    caption: { type: String, default: "" },
    mediaUrls: { type: [String], default: [] },
    tags: { type: [String], default: [], index: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

PostSchema.index({ caption: "text", tags: "text" });

const Post = mongoose.model("Post", PostSchema);
module.exports = { Post };

