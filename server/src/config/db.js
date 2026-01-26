const mongoose = require("mongoose");
const { env } = require("./env");

async function connectDB() {
  if (!env.MONGODB_URI) {
    // Allow booting without DB for initial setup, but most routes will fail.
    console.warn("[db] MONGODB_URI missing. Set it in server/.env");
    return;
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(env.MONGODB_URI);
  console.log("[db] connected");
}

module.exports = { connectDB };

