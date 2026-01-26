const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema(
  {
    // The two users involved
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],

    // Optional: Snapshots for the "Inbox" view (so you don't have to query messages table just to list chats)
    lastMessage: { type: String, default: "" },
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

// ⚡ Performance Index:
// This ensures we can quickly find if a chat already exists between User A and User B
ConversationSchema.index({ participants: 1 });

const Conversation = mongoose.model("Conversation", ConversationSchema);
module.exports = { Conversation };
