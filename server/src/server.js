const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const { createServer } = require("http");
const { Server } = require("socket.io");
const path = require("path");
const { env } = require("./config/env");
const { connectDB } = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const { ok } = require("./utils/apiResponse");
const { ensureDir } = require("./config/multer");

// 👇 NEW: Import Models for Chat
const { Message } = require("./models/Message");
const { Conversation } = require("./models/Conversation");

async function main() {
  await connectDB();

  const app = express();
  const httpServer = createServer(app);

  // 👇 FIXED: Socket.io with correct CORS
  const io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_ORIGIN || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true, // ✅ Required for cookies/sessions
    },
  });

  // Basic middlewares
  // Allow images to be loaded from different ports (e.g. 5173 loading from 5000)
  app.use(
    helmet({
      crossOriginResourcePolicy: false,
    }),
  );
  app.use(
    cors({
      origin: env.CLIENT_ORIGIN || "http://localhost:5173",
      credentials: true, // ✅ Ensure HTTP requests also allow credentials
    }),
  );
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(morgan("dev"));

  // Ensure upload folders exist and serve static files
  const uploadsRoot = path.join(process.cwd(), "uploads");
  ["avatars", "posts", "chat", "trips", "identify"].forEach((folder) => {
    ensureDir(path.join(uploadsRoot, folder));
  });
  app.use("/uploads", express.static(uploadsRoot));

  // Simple rate limit for auth routes (placeholder)
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  });

  // Routers
  const apiRouter = express.Router();
  const { userRouter } = require("./routes/userRoutes");
  const { postRouter } = require("./routes/postRoutes");
  const { chatRouter } = require("./routes/chatRoutes");
  const { tripRouter } = require("./routes/tripRoutes");
  const { matchRouter } = require("./routes/matchRoutes");
  const { dashboardRouter } = require("./routes/dashboardRoutes");
  const { expenseRouter } = require("./routes/expenseRoutes");
  const { identityRouter } = require("./routes/identifyRoutes");

  apiRouter.get("/health", (req, res) =>
    ok(res, "OK", { uptime: process.uptime() }),
  );

  apiRouter.use(userRouter);
  apiRouter.use(postRouter);
  apiRouter.use(chatRouter);
  apiRouter.use(tripRouter);
  apiRouter.use(matchRouter);
  apiRouter.use(dashboardRouter);
  apiRouter.use(expenseRouter);

  app.use("/api", apiRouter);
  app.use("/api", identityRouter);

  app.use(notFound);
  app.use(errorHandler);

  // 👇 NEW: Real-time Chat Logic
  io.on("connection", (socket) => {
    console.log("🟢 Client connected:", socket.id);

    // 1. Join a specific Conversation Room
    socket.on("joinConversation", (conversationId) => {
      socket.join(conversationId);
      console.log(`Socket ${socket.id} joined room: ${conversationId}`);
    });

    // 2. Handle Sending Messages
    socket.on("sendMessage", async ({ conversationId, senderId, content }) => {
      try {
        // A. Save to Database
        const message = await Message.create({
          conversationId,
          senderId,
          content,
          messageType: "text",
          seenBy: [senderId],
        });

        // B. Update Conversation "Last Message" (for Inbox preview)
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: content,
          lastMessageAt: new Date(),
        });

        // C. Populate Sender Info (so frontend can show avatar immediately)
        await message.populate("senderId", "fullName username avatarUrl");

        // D. Broadcast to everyone in the room (Including Sender)
        io.to(conversationId).emit("receiveMessage", message);
      } catch (err) {
        console.error("🔴 Message error:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("🔴 Client disconnected:", socket.id);
    });
  });

  httpServer.listen(env.PORT, () => {
    console.log(`[server] listening on http://localhost:${env.PORT}`);
  });
}

// Run only when executed directly
if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { main };
