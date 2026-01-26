const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { env } = require("../config/env");
const { AppError } = require("../utils/AppError");
const { User } = require("../models/User");

async function requireAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";
    if (!token) throw new AppError("Unauthorized", 401, "UNAUTHORIZED");

    const payload = jwt.verify(token, env.JWT_SECRET);
    if (!payload?.sub || !mongoose.isValidObjectId(payload.sub)) throw new AppError("Unauthorized", 401, "UNAUTHORIZED");

    const user = await User.findById(payload.sub);
    if (!user) throw new AppError("Unauthorized", 401, "UNAUTHORIZED");

    req.user = user;
    next();
  } catch (e) {
    next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
  }
}

module.exports = { requireAuth };

