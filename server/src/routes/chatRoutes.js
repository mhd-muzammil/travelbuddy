const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");
const { Conversation } = require("../models/Conversation");
const { Message } = require("../models/Message");
const { ok } = require("../utils/apiResponse");
const { AppError } = require("../utils/AppError");
const { createUploader } = require("../config/multer");

const router = express.Router();
const chatUploader = createUploader("chat");

// ✅ 1. Start or Get a Conversation (Fixes the 404 error)
router.post("/chat/conversation", requireAuth, async (req, res, next) => {
  try {
    const { targetUserId } = req.body;
    if (!targetUserId) throw new AppError("Target User ID required", 400);

    // Find conversation between these two users
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, targetUserId] },
    }).populate("participants", "fullName username avatarUrl");

    // If not found, create a new one
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, targetUserId],
      });
      await conversation.populate(
        "participants",
        "fullName username avatarUrl",
      );
    }

    return ok(res, "Conversation ready", { conversation });
  } catch (e) {
    next(e);
  }
});

// ✅ 2. Get Message History
router.get(
  "/chat/:conversationId/messages",
  requireAuth,
  async (req, res, next) => {
    try {
      const { conversationId } = req.params;

      const messages = await Message.find({ conversationId })
        .sort({ createdAt: 1 })
        .populate("senderId", "fullName username avatarUrl");

      return ok(res, "Messages", { messages });
    } catch (e) {
      next(e);
    }
  },
);

// ✅ 3. Image Upload (Your existing code, updated to match 'participants' field)
router.post(
  "/chat/:conversationId/image",
  requireAuth,
  chatUploader.single("image"),
  async (req, res, next) => {
    try {
      if (!req.file)
        throw new AppError("No image file provided", 400, "NO_FILE");
      const { conversationId } = req.params;

      const convo = await Conversation.findById(conversationId);
      if (!convo)
        throw new AppError("Conversation not found", 404, "NOT_FOUND");

      // Check if user is a participant
      const isMember = convo.participants.some(
        (m) => String(m) === String(req.user._id),
      );
      if (!isMember) throw new AppError("Forbidden", 403, "FORBIDDEN");

      const imageUrl = `/uploads/chat/${req.file.filename}`;
      const msg = await Message.create({
        conversationId,
        senderId: req.user._id,
        messageType: "image",
        content: "",
        imageUrl,
        seenBy: [req.user._id],
      });

      convo.lastMessage = "[image]";
      await convo.save();

      return ok(res, "Image message sent", { message: msg });
    } catch (e) {
      next(e);
    }
  },
);

module.exports = { chatRouter: router };
