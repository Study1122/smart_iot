import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "./models/user.model.js"; // ✅ fixed case

let io;

/* =========================
   Initialize Socket.IO
========================= */
export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*", // 🔒 tighten later in production
      methods: ["GET", "POST"],
    },
  });

  /* =========================
     JWT Authentication
  ========================= */
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication token missing"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select("_id name");
      if (!user) return next(new Error("User not found"));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Invalid or expired token"));
    }
  });

  /* =========================
     Socket Events
  ========================= */
  io.on("connection", (socket) => {
    console.log(`🟢 WS connected: ${socket.user.name}`);

    // Join device-specific room
    socket.on("join-device", (deviceId) => {
      socket.join(`device:${deviceId}`);
      console.log(`📡 ${socket.user.name} joined device:${deviceId}`);
    });

    socket.on("leave-device", (deviceId) => {
      socket.leave(`device:${deviceId}`);
      console.log(`📴 ${socket.user.name} left device:${deviceId}`);
    });

    socket.on("disconnect", () => {
      console.log(`🔴 WS disconnected: ${socket.user.name}`);
    });
  });

  return io;
};

/* =========================
   Safe accessor for controllers
========================= */
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};