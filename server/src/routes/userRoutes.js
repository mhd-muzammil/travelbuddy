const express = require("express");
const { body } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { env } = require("../config/env");
const { User } = require("../models/User");
const { requireAuth } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validate");
const { ok, created } = require("../utils/apiResponse");
const { AppError } = require("../utils/AppError");
const { createUploader } = require("../config/multer");

const router = express.Router();

function signToken(userId) {
  return jwt.sign({ sub: String(userId) }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

// Auth: register
router.post(
  "/auth/register",
  [
    body("fullName").isString().isLength({ min: 2 }),
    body("username").isString().isLength({ min: 3 }),
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { fullName, username, email, password } = req.body;
      const existing = await User.findOne({ $or: [{ email }, { username }] });
      if (existing)
        throw new AppError(
          "User with email or username already exists",
          400,
          "USER_EXISTS",
        );
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await User.create({
        fullName,
        username,
        email,
        passwordHash,
      });
      const token = signToken(user._id);
      return created(res, "Registered", { user, token });
    } catch (e) {
      next(e);
    }
  },
);

// Auth: login
router.post(
  "/auth/login",
  [body("email").isEmail(), body("password").isLength({ min: 1 })],
  validate,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email }).select("+passwordHash");
      if (!user)
        throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
      const okPw = await bcrypt.compare(password, user.passwordHash);
      if (!okPw)
        throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
      const token = signToken(user._id);
      user.passwordHash = undefined;
      return ok(res, "Logged in", { user, token });
    } catch (e) {
      next(e);
    }
  },
);

// Auth: me
router.get("/auth/me", requireAuth, async (req, res) => {
  return ok(res, "Me", { user: req.user });
});

// Users: me profile
router.get("/users/me", requireAuth, async (req, res) =>
  ok(res, "Me", { user: req.user }),
);

router.put(
  "/users/me",
  requireAuth,
  [
    body("fullName").optional().isString(),
    body("username").optional().isString(),
    body("age").optional().isInt({ min: 0 }),
    body("gender").optional().isString(),
    body("phone").optional().isString(),
    body("bio").optional().isString(),
    body("languages").optional().isArray(),
    body("location").optional().isObject(),
    body("travelStyle").optional().isString(),
    body("interests").optional().isArray(),
    body("preferredDestinations").optional().isArray(),
    body("preferredTripDuration").optional().isString(),
    body("budgetRange").optional().isObject(),
    body("privacy").optional().isObject(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const updates = req.body;
      const user = await User.findByIdAndUpdate(req.user._id, updates, {
        new: true,
      });
      return ok(res, "Profile updated", { user });
    } catch (e) {
      next(e);
    }
  },
);

// Change password
router.put(
  "/users/me/password",
  requireAuth,
  [
    body("currentPassword").isString(),
    body("newPassword").isLength({ min: 6 }),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user._id).select("+passwordHash");
      if (!user) throw new AppError("User not found", 404, "NOT_FOUND");
      const okPw = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!okPw)
        throw new AppError(
          "Current password incorrect",
          400,
          "INVALID_PASSWORD",
        );
      user.passwordHash = await bcrypt.hash(newPassword, 10);
      await user.save();
      return ok(res, "Password updated", {});
    } catch (e) {
      next(e);
    }
  },
);

// Avatar upload with multer
const avatarUploader = createUploader("avatars");

router.put(
  "/users/me/avatar",
  requireAuth,
  avatarUploader.single("avatar"),
  async (req, res, next) => {
    try {
      if (!req.file)
        throw new AppError("No avatar file provided", 400, "NO_FILE");
      const publicPath = `/uploads/avatars/${req.file.filename}`;
      req.user.avatarUrl = publicPath;
      await req.user.save();
      return ok(res, "Avatar updated", { avatarUrl: publicPath });
    } catch (e) {
      next(e);
    }
  },
);

// Delete account
router.delete("/users/me", requireAuth, async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    return ok(res, "Account deleted", {});
  } catch (e) {
    next(e);
  }
});

// ✅ NEW: Get Specific User Public Profile (Missing piece)
router.get("/users/:id", requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-passwordHash");
    if (!user) throw new AppError("User not found", 404, "NOT_FOUND");
    return ok(res, "User profile", { user });
  } catch (e) {
    next(e);
  }
});

module.exports = { userRouter: router };
