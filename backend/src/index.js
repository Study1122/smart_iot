import dotenv from "dotenv";
dotenv.config();

import {createServer} from "http";
import startDeviceStatusCron from "./utils/deviceStatus.cron.js";
import app from "./app.js";
import { initSocket } from "./socket.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // ✅ WAIT for DB
    await connectDB();
    console.log("✅ MongoDB connected");

    const server = createServer(app);

    // ✅ Init sockets AFTER DB
    initSocket(server);

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);

      // ✅ Start cron ONLY now
      startDeviceStatusCron();
    });

  } catch (err) {
    console.error("❌ Server startup failed:", err.message);
    process.exit(1);
  }
};

startServer();

