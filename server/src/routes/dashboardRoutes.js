const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");
const { ok } = require("../utils/apiResponse");
const { Trip } = require("../models/Trip");
const { MatchRequest } = require("../models/MatchRequest");

const router = express.Router();

// GET /dashboard
router.get("/dashboard", requireAuth, async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Count active trips (trips where user is a member)
    const activeTrips = await Trip.countDocuments({
      members: userId,
    });

    // Count pending requests (requests sent TO the user that are pending)
    const pendingRequests = await MatchRequest.countDocuments({
      toUser: userId,
      status: "pending",
    });

    // Count matches (accepted requests where user is either fromUser or toUser)
    const matches = await MatchRequest.countDocuments({
      $or: [{ fromUser: userId }, { toUser: userId }],
      status: "accepted",
    });

    // Placeholder arrays for recommendations
    const recommendedBuddies = [];
    const recommendedTrips = [];

    return ok(res, "Dashboard data", {
      stats: {
        pendingRequests,
        matches,
        activeTrips,
      },
      recommendedBuddies,
      recommendedTrips,
    });
  } catch (e) {
    next(e);
  }
});

module.exports = { dashboardRouter: router };
