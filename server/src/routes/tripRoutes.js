const express = require("express");
const { body } = require("express-validator");
const { requireAuth } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validate");
const { Trip } = require("../models/Trip");
const { ItineraryItem } = require("../models/ItineraryItem");
const { ok, created } = require("../utils/apiResponse");
const { AppError } = require("../utils/AppError");
const { createUploader } = require("../config/multer");

const router = express.Router();
const galleryUploader = createUploader("trips");

// ==========================================
// 🛡️ HELPERS
// ==========================================

// Helper: Ensure user is a full MEMBER (not just a requester)
async function ensureTripMember(tripId, userId) {
  const trip = await Trip.findById(tripId);
  if (!trip) throw new AppError("Trip not found", 404, "NOT_FOUND");
  const isMember =
    String(trip.creatorId) === String(userId) ||
    trip.members.some((m) => String(m) === String(userId));
  if (!isMember) throw new AppError("Forbidden", 403, "FORBIDDEN");
  return trip;
}

// Helper: Ensure user is the CREATOR (for approvals)
async function ensureTripCreator(tripId, userId) {
  const trip = await Trip.findById(tripId);
  if (!trip) throw new AppError("Trip not found", 404, "NOT_FOUND");
  if (String(trip.creatorId) !== String(userId)) {
    throw new AppError("Only the trip creator can do this", 403, "FORBIDDEN");
  }
  return trip;
}

// ==========================================
// 🌍 CORE TRIP ROUTES (RESTORED)
// ==========================================

// 1. Create Trip
router.post(
  "/trips",
  requireAuth,
  [
    body("destination").isString().isLength({ min: 2 }),
    body("startDate").isString(),
    body("endDate").isString(),
    body("budget").optional().isNumeric(),
    body("tripType").optional().isString(),
    body("maxMembers").optional().isNumeric(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const {
        destination,
        startDate,
        endDate,
        budget = 0,
        tripType = "group",
        maxMembers = 4,
        tags = [],
        description = "",
      } = req.body;
      const trip = await Trip.create({
        creatorId: req.user._id,
        destination,
        startDate,
        endDate,
        budget,
        tripType,
        maxMembers,
        members: [req.user._id],
        tags,
        description,
      });
      return created(res, "Trip created", { trip });
    } catch (e) {
      next(e);
    }
  },
);

// 2. List Trips (GET /trips?scope=...)
router.get("/trips", requireAuth, async (req, res, next) => {
  try {
    const scope = req.query.scope || "all";
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const skip = (page - 1) * limit;

    let query = {};

    if (scope === "mine") {
      query.creatorId = req.user._id;
    } else if (scope === "joined") {
      query.members = req.user._id;
    }
    // scope === "all" -> no filter

    const [trips, total] = await Promise.all([
      Trip.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("members", "fullName username")
        .populate("creatorId", "fullName username"),
      Trip.countDocuments(query),
    ]);

    return ok(res, "Trips", {
      trips,
      total,
      page,
      limit,
      scope,
    });
  } catch (e) {
    next(e);
  }
});

// 3. Get Single Trip
router.get("/trips/:id", requireAuth, async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id).populate(
      "members",
      "fullName username",
    );
    if (!trip) throw new AppError("Trip not found", 404, "NOT_FOUND");
    return ok(res, "Trip", { trip });
  } catch (e) {
    next(e);
  }
});

// ==========================================
// 🤝 TRUST & SAFETY: JOIN REQUESTS
// ==========================================

// 4. User Requests to Join (Replaces instant join)
router.post("/trips/:id/join", requireAuth, async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) throw new AppError("Trip not found", 404, "NOT_FOUND");

    // Check if already a member
    if (
      trip.members.includes(req.user._id) ||
      String(trip.creatorId) === String(req.user._id)
    ) {
      return ok(res, "You are already a member", { status: "member" });
    }

    // Check if already requested
    if (trip.joinRequests.includes(req.user._id)) {
      return ok(res, "Request already sent", { status: "pending" });
    }

    // Add to waiting list
    trip.joinRequests.push(req.user._id);
    await trip.save();

    return ok(res, "Join request sent", { status: "pending" });
  } catch (e) {
    next(e);
  }
});

// 5. Creator Views Pending Requests
router.get("/trips/:id/requests", requireAuth, async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id).populate(
      "joinRequests",
      "fullName username avatarUrl",
    );

    if (!trip) throw new AppError("Trip not found", 404, "NOT_FOUND");
    if (String(trip.creatorId) !== String(req.user._id)) {
      throw new AppError("Unauthorized", 403, "FORBIDDEN");
    }

    return ok(res, "Pending Requests", { requests: trip.joinRequests });
  } catch (e) {
    next(e);
  }
});

// 6. Creator Approves a Request
router.post(
  "/trips/:id/requests/:userId/approve",
  requireAuth,
  async (req, res, next) => {
    try {
      const trip = await ensureTripCreator(req.params.id, req.user._id);
      const targetUserId = req.params.userId;

      if (
        !trip.joinRequests.some((id) => String(id) === String(targetUserId))
      ) {
        throw new AppError("User has not requested to join", 404, "NOT_FOUND");
      }

      if (trip.members.length >= trip.maxMembers) {
        throw new AppError("Trip is full", 400, "TRIP_FULL");
      }

      trip.joinRequests = trip.joinRequests.filter(
        (id) => String(id) !== String(targetUserId),
      );
      trip.members.push(targetUserId);

      await trip.save();
      return ok(res, "User approved", { members: trip.members });
    } catch (e) {
      next(e);
    }
  },
);

// 7. Creator Rejects a Request
router.post(
  "/trips/:id/requests/:userId/reject",
  requireAuth,
  async (req, res, next) => {
    try {
      const trip = await ensureTripCreator(req.params.id, req.user._id);
      const targetUserId = req.params.userId;

      trip.joinRequests = trip.joinRequests.filter(
        (id) => String(id) !== String(targetUserId),
      );

      await trip.save();
      return ok(res, "User rejected");
    } catch (e) {
      next(e);
    }
  },
);

// ==========================================
// 📅 ITINERARY & EXTRAS
// ==========================================

router.get("/trips/:id/itinerary", requireAuth, async (req, res, next) => {
  try {
    await ensureTripMember(req.params.id, req.user._id);
    const items = await ItineraryItem.find({ tripId: req.params.id });
    return ok(res, "Itinerary", { items });
  } catch (e) {
    next(e);
  }
});

router.post(
  "/trips/:id/itinerary/items",
  requireAuth,
  [
    body("dayNumber").isNumeric(),
    body("title").isString().isLength({ min: 1 }),
    body("time").optional().isString(),
    body("location").optional().isString(),
    body("notes").optional().isString(),
    body("estimatedCost").optional().isNumeric(),
  ],
  validate,
  async (req, res, next) => {
    try {
      await ensureTripMember(req.params.id, req.user._id);
      const item = await ItineraryItem.create({
        tripId: req.params.id,
        dayNumber: req.body.dayNumber,
        time: req.body.time || "",
        title: req.body.title,
        location: req.body.location || "",
        notes: req.body.notes || "",
        estimatedCost: req.body.estimatedCost || 0,
        createdBy: req.user._id,
      });
      return created(res, "Itinerary item created", { item });
    } catch (e) {
      next(e);
    }
  },
);

router.get("/trips/:id/notes", requireAuth, async (req, res, next) => {
  try {
    const trip = await ensureTripMember(req.params.id, req.user._id);
    return ok(res, "Notes", { note: trip.note });
  } catch (e) {
    next(e);
  }
});

router.put(
  "/trips/:id/notes",
  requireAuth,
  [body("note").isString()],
  validate,
  async (req, res, next) => {
    try {
      const trip = await ensureTripMember(req.params.id, req.user._id);
      trip.note = req.body.note;
      await trip.save();
      return ok(res, "Notes updated", { note: trip.note });
    } catch (e) {
      next(e);
    }
  },
);

router.post(
  "/trips/:id/gallery",
  requireAuth,
  galleryUploader.array("images", 10),
  async (req, res, next) => {
    try {
      const trip = await ensureTripMember(req.params.id, req.user._id);
      if (!req.files || !req.files.length)
        throw new AppError("No images provided", 400, "NO_FILE");
      const urls = req.files.map((f) => `/uploads/trips/${f.filename}`);
      trip.gallery.push(...urls);
      await trip.save();
      return ok(res, "Gallery updated", { gallery: trip.gallery });
    } catch (e) {
      next(e);
    }
  },
);

module.exports = { tripRouter: router };
