const express = require("express");
const { body } = require("express-validator");
const { requireAuth } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validate");
const { Post } = require("../models/Post");
const { ok, created } = require("../utils/apiResponse");
const { createUploader } = require("../config/multer");

const router = express.Router();
const postUploader = createUploader("posts");

// Create post with optional images
router.post(
  "/posts",
  requireAuth,
  postUploader.array("media", 6),
  [body("caption").optional().isString(), body("tags").optional().isArray()],
  validate,
  async (req, res, next) => {
    try {
      const mediaUrls = (req.files || []).map((f) => `/uploads/posts/${f.filename}`);
      const { caption = "", tags = [], tripId } = req.body;
      const post = await Post.create({
        userId: req.user._id,
        tripId: tripId || undefined,
        caption,
        mediaUrls,
        tags,
      });
      return created(res, "Post created", { post });
    } catch (e) {
      next(e);
    }
  }
);

// Basic feed list
router.get("/posts", requireAuth, async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const skip = (page - 1) * limit;
    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "fullName username avatarUrl");
    return ok(res, "Posts", { posts, page, limit });
  } catch (e) {
    next(e);
  }
});

module.exports = { postRouter: router };

