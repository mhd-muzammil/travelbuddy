const express = require("express");
const { body } = require("express-validator");
const { requireAuth } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validate");
const { Trip } = require("../models/Trip");
const { Expense } = require("../models/Expense");
const { ok, created } = require("../utils/apiResponse");
const { AppError } = require("../utils/AppError");

const router = express.Router();

// Helper to ensure user is a trip member
async function ensureTripMember(tripId, userId) {
  const trip = await Trip.findById(tripId);
  if (!trip) throw new AppError("Trip not found", 404, "NOT_FOUND");
  const isMember =
    String(trip.creatorId) === String(userId) ||
    trip.members.some((m) => String(m) === String(userId));
  if (!isMember) throw new AppError("Forbidden", 403, "FORBIDDEN");
  return trip;
}

// GET /expenses/trip/:tripId
router.get("/expenses/trip/:tripId", requireAuth, async (req, res, next) => {
  try {
    await ensureTripMember(req.params.tripId, req.user._id);
    const expenses = await Expense.find({ tripId: req.params.tripId })
      .sort({ createdAt: -1 })
      .populate("paidBy", "fullName username avatarUrl")
      .populate("splitBetween.userId", "fullName username avatarUrl");
    return ok(res, "Expenses", { expenses });
  } catch (e) {
    next(e);
  }
});

// POST /expenses/trip/:tripId
router.post(
  "/expenses/trip/:tripId",
  requireAuth,
  [
    body("title").isString().isLength({ min: 1 }),
    body("amount").isNumeric().isFloat({ min: 0 }),
    // ✅ FIX 1: Add toLowerCase() to handle "Activity" vs "activity"
    body("category")
      .optional()
      .toLowerCase()
      .isIn(["hotel", "food", "transport", "activity", "other"]),
    // ✅ FIX 2: Make paidBy optional in validation (we handle default in logic)
    body("paidBy").optional().isMongoId(),
    body("splitType").optional().isIn(["equal", "custom"]),
    body("splitBetween").optional().isArray(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const trip = await ensureTripMember(req.params.tripId, req.user._id);

      // ✅ FIX 3: Default paidBy to req.user._id if not provided
      let {
        title,
        amount,
        category = "other",
        paidBy,
        splitType = "equal",
        splitBetween = [],
      } = req.body;

      if (!paidBy) {
        paidBy = req.user._id;
      }

      // Validate paidBy is a trip member
      const isPaidByMember =
        String(trip.creatorId) === String(paidBy) ||
        trip.members.some((m) => String(m) === String(paidBy));
      if (!isPaidByMember) {
        throw new AppError(
          "PaidBy user must be a trip member",
          400,
          "INVALID_MEMBER",
        );
      }

      let finalSplitBetween = [];

      if (splitType === "equal") {
        // Split equally among all trip members
        const allMembers = [trip.creatorId, ...trip.members];
        const uniqueMembers = [...new Set(allMembers.map((m) => String(m)))];
        const perPersonAmount = amount / uniqueMembers.length;

        finalSplitBetween = uniqueMembers.map((memberId) => ({
          userId: memberId,
          amount: perPersonAmount,
        }));
      } else {
        // Custom split
        if (!splitBetween || splitBetween.length === 0) {
          throw new AppError(
            "splitBetween required for custom split",
            400,
            "INVALID_SPLIT",
          );
        }

        // Validate all splitBetween users are trip members
        for (const split of splitBetween) {
          const isMember =
            String(trip.creatorId) === String(split.userId) ||
            trip.members.some((m) => String(m) === String(split.userId));
          if (!isMember) {
            throw new AppError(
              `User ${split.userId} is not a trip member`,
              400,
              "INVALID_MEMBER",
            );
          }
        }

        finalSplitBetween = splitBetween.map((split) => ({
          userId: split.userId,
          amount: Number(split.amount),
        }));
      }

      const expense = await Expense.create({
        tripId: req.params.tripId,
        title,
        amount: Number(amount),
        category,
        paidBy,
        splitType,
        splitBetween: finalSplitBetween,
      });

      await expense.populate("paidBy", "fullName username avatarUrl");
      await expense.populate(
        "splitBetween.userId",
        "fullName username avatarUrl",
      );

      return created(res, "Expense created", { expense });
    } catch (e) {
      next(e);
    }
  },
);

// GET /expenses/trip/:tripId/summary
router.get(
  "/expenses/trip/:tripId/summary",
  requireAuth,
  async (req, res, next) => {
    try {
      const trip = await ensureTripMember(req.params.tripId, req.user._id);
      const expenses = await Expense.find({ tripId: req.params.tripId });

      // Get all unique members
      const allMembers = [trip.creatorId, ...trip.members];
      const uniqueMemberIds = [...new Set(allMembers.map((m) => String(m)))];

      // Calculate totals
      let totalSpent = 0;
      const perMember = {};

      // Initialize perMember tracking
      uniqueMemberIds.forEach((memberId) => {
        perMember[memberId] = {
          paid: 0,
          owes: 0,
          net: 0,
        };
      });

      // Process each expense
      expenses.forEach((expense) => {
        totalSpent += expense.amount;

        const paidById = String(expense.paidBy);
        if (perMember[paidById]) {
          perMember[paidById].paid += expense.amount;
        }

        // Add to owes for each person in splitBetween
        expense.splitBetween.forEach((split) => {
          const userId = String(split.userId);
          if (perMember[userId]) {
            perMember[userId].owes += split.amount;
          }
        });
      });

      // Calculate net (paid - owes) for each member
      Object.keys(perMember).forEach((memberId) => {
        perMember[memberId].net =
          perMember[memberId].paid - perMember[memberId].owes;
      });

      // Populate member details for response
      const { User } = require("../models/User");
      const mongoose = require("mongoose");
      const memberObjectIds = uniqueMemberIds.map(
        (id) => new mongoose.Types.ObjectId(id),
      );
      const memberDetails = await User.find({
        _id: { $in: memberObjectIds },
      }).select("fullName username avatarUrl");

      const perMemberBreakdown = memberDetails.map((user) => {
        const memberId = String(user._id);
        return {
          userId: user._id,
          fullName: user.fullName,
          username: user.username,
          avatarUrl: user.avatarUrl,
          paid: perMember[memberId]?.paid || 0,
          owes: perMember[memberId]?.owes || 0,
          net: perMember[memberId]?.net || 0,
        };
      });

      return ok(res, "Expense summary", {
        totalSpent,
        perMember: perMemberBreakdown,
      });
    } catch (e) {
      next(e);
    }
  },
);

module.exports = { expenseRouter: router };
