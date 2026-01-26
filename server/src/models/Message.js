const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true, index: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    messageType: { type: String, enum: ["text", "image"], default: "text" },
    content: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

MessageSchema.index({ conversationId: 1, createdAt: -1 });

const Message = mongoose.model("Message", MessageSchema);
module.exports = { Message };

