const express = require("express");
const { body } = require("express-validator");
const { requireAuth } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validate");
const { User } = require("../models/User");
const { ok } = require("../utils/apiResponse");
const { AppError } = require("../utils/AppError");
const { createUploader } = require("../config/multer");

const router = express.Router();
// Create a specific folder for IDs if you want, or reuse 'default'
const identityUploader = createUploader("identity");

// 1. User: Submit Verification Request
// Accepts a file (key: "document") OR a text link (key: "socialLink")
router.post(
  "/identity/request",
  requireAuth,
  identityUploader.single("document"),
  async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id);

      // Determine what was submitted
      let docUrl = "";
      if (req.file) {
        docUrl = `/uploads/identity/${req.file.filename}`;
      } else if (req.body.socialLink) {
        docUrl = req.body.socialLink;
      } else {
        throw new AppError(
          "Please provide an ID document or Social Link",
          400,
          "MISSING_DATA",
        );
      }

      // Update status
      user.identityStatus = "pending";
      user.identityDoc = docUrl;
      await user.save();

      return ok(res, "Verification requested successfully", {
        status: user.identityStatus,
        docUrl,
      });
    } catch (e) {
      next(e);
    }
  },
);

// 2. Admin: List Pending Requests
// (In a real app, add a 'requireAdmin' middleware here)
router.get("/identity/pending", requireAuth, async (req, res, next) => {
  try {
    const pendingUsers = await User.find({ identityStatus: "pending" }).select(
      "fullName username email identityDoc identityStatus",
    );

    return ok(res, "Pending requests", { requests: pendingUsers });
  } catch (e) {
    next(e);
  }
});

// 3. Admin: Approve or Reject
router.post(
  "/identity/review",
  requireAuth,
  [body("userId").isMongoId(), body("action").isIn(["approve", "reject"])],
  validate,
  async (req, res, next) => {
    try {
      const { userId, action } = req.body;
      const targetUser = await User.findById(userId);
      if (!targetUser) throw new AppError("User not found", 404, "NOT_FOUND");

      if (action === "approve") {
        targetUser.isIdentityVerified = true;
        targetUser.identityStatus = "verified";
      } else {
        targetUser.isIdentityVerified = false;
        targetUser.identityStatus = "rejected";
      }

      await targetUser.save();

      return ok(res, `User ${action}d`, {
        userId: targetUser._id,
        isVerified: targetUser.isIdentityVerified,
        status: targetUser.identityStatus,
      });
    } catch (e) {
      next(e);
    }
  },
);

module.exports = { identityRouter: router };
