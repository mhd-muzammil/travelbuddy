const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");
const { User } = require("../models/User");
const { MatchRequest } = require("../models/MatchRequest"); // 👈 Don't forget this import!
const { ok, created } = require("../utils/apiResponse");
const { AppError } = require("../utils/AppError");

const router = express.Router();

// ==========================================
// 🔍 1. SEARCH & MATCHING (This is what you had)
// ==========================================
router.get("/match/suggestions", requireAuth, async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 9,
      q,
      travelStyle,
      destination,
      language,
    } = req.query;
    const currentUser = req.user;

    // 1. Build Database Filter
    let filter = { _id: { $ne: currentUser._id } }; // Exclude yourself

    // Search by Name or City
    if (q) {
      filter.$or = [
        { fullName: { $regex: q, $options: "i" } },
        { username: { $regex: q, $options: "i" } },
        { "location.city": { $regex: q, $options: "i" } },
      ];
    }

    if (travelStyle) filter.travelStyle = travelStyle;

    // 2. Fetch Candidates
    const candidates = await User.find(filter).select("-password -__v");

    // 3. Smart Scoring Algorithm
    const scoredResults = candidates.map((user) => {
      let score = 50;
      let reasons = [];
      let commonInterests = [];

      if (
        currentUser.travelStyle &&
        user.travelStyle === currentUser.travelStyle
      ) {
        score += 20;
        reasons.push("Matches your travel style");
      }

      if (
        currentUser.location?.country &&
        user.location?.country === currentUser.location?.country
      ) {
        score += 15;
        reasons.push("Lives in same country");
      }

      score += Math.floor(Math.random() * 15);
      if (reasons.length === 0) reasons.push("New traveler");

      return {
        user,
        matchScore: Math.min(score, 100),
        commonInterests,
        reasons,
      };
    });

    scoredResults.sort((a, b) => b.matchScore - a.matchScore);

    const startIndex = (Number(page) - 1) * Number(limit);
    const paginatedResults = scoredResults.slice(
      startIndex,
      startIndex + Number(limit),
    );

    return ok(res, "Matches found", {
      results: paginatedResults,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: scoredResults.length,
        totalPages: Math.ceil(scoredResults.length / Number(limit)),
      },
    });
  } catch (e) {
    next(e);
  }
});

// ==========================================
// 🤝 2. FRIEND REQUEST LOGIC (You were missing this!)
// ==========================================

// Get Relationship Status
router.get("/match/requests", requireAuth, async (req, res, next) => {
  try {
    const { userId } = req.query;
    if (!userId) throw new AppError("Target User ID required", 400);

    const request = await MatchRequest.findOne({
      $or: [
        { fromUser: req.user._id, toUser: userId },
        { fromUser: userId, toUser: req.user._id },
      ],
    });

    const isBlocked = req.user.blockedUsers?.includes(userId);

    let responseReq = null;
    if (request) {
      responseReq = request.toObject();
      responseReq.direction =
        String(request.fromUser) === String(req.user._id)
          ? "outgoing"
          : "incoming";
    }

    return ok(res, "Relationship status", {
      request: responseReq,
      isBlocked: !!isBlocked,
    });
  } catch (e) {
    next(e);
  }
});

// Send Request
router.post("/match/request", requireAuth, async (req, res, next) => {
  try {
    const { toUserId } = req.body;
    if (!toUserId) throw new AppError("Target user ID required", 400);
    if (String(toUserId) === String(req.user._id))
      throw new AppError("Cannot add yourself", 400);

    const existing = await MatchRequest.findOne({
      $or: [
        { fromUser: req.user._id, toUser: toUserId },
        { fromUser: toUserId, toUser: req.user._id },
      ],
    });

    if (existing) {
      if (existing.status === "pending")
        throw new AppError("Request already pending", 400);
      if (existing.status === "accepted")
        throw new AppError("Already friends", 400);
    }

    const newReq = await MatchRequest.create({
      fromUser: req.user._id,
      toUser: toUserId,
      status: "pending",
      matchScore: 0,
    });

    return created(res, "Request sent", { request: newReq });
  } catch (e) {
    next(e);
  }
});

// Accept Request
router.post("/match/accept", requireAuth, async (req, res, next) => {
  try {
    const { requestId } = req.body;
    const request = await MatchRequest.findById(requestId);

    if (!request) throw new AppError("Request not found", 404);
    if (String(request.toUser) !== String(req.user._id))
      throw new AppError("Not authorized", 403);

    request.status = "accepted";
    await request.save();

    return ok(res, "Request accepted", { request });
  } catch (e) {
    next(e);
  }
});

// Reject Request
router.post("/match/reject", requireAuth, async (req, res, next) => {
  try {
    const { requestId } = req.body;
    await MatchRequest.findByIdAndDelete(requestId);
    return ok(res, "Request rejected");
  } catch (e) {
    next(e);
  }
});

// Cancel Request
router.delete(
  "/match/cancel/:requestId",
  requireAuth,
  async (req, res, next) => {
    try {
      const request = await MatchRequest.findOneAndDelete({
        _id: req.params.requestId,
        fromUser: req.user._id,
      });
      if (!request) throw new AppError("Request not found", 404);
      return ok(res, "Request cancelled");
    } catch (e) {
      next(e);
    }
  },
);

// ==========================================
// 🔔 NOTIFICATIONS / INCOMING REQUESTS
// ==========================================

// Get all pending incoming requests for the current user
router.get("/match/incoming", requireAuth, async (req, res, next) => {
  try {
    const requests = await MatchRequest.find({
      toUser: req.user._id,
      status: "pending",
    })
    .populate("fromUser", "fullName username avatarUrl location travelStyle") // Get sender details
    .sort({ createdAt: -1 });

    return ok(res, "Incoming requests", { requests });
  } catch (e) {
    next(e);
  }
});

module.exports = { matchRouter: router };
