// frontend/src/services/socket.js
import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

let socket;

export const connectSocket = () => {
  if (socket) return socket;

  const token = localStorage.getItem("token");
  if (!token) return null;

  socket = io(API_URL, {
    auth: {
      token,
    },
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    console.log("🟢 Socket connected:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected");
  });

  return socket;
};

export const joinDeviceRoom = (deviceId) => {
  if (!socket) return;
  socket.emit("device:join", deviceId);
};

export const leaveDeviceRoom = (deviceId) => {
  if (!socket) return;
  socket.emit("device:leave", deviceId);
};

export const onFeatureUpdate = (callback) => {
  if (!socket) return;
  socket.on("feature:update", callback);
};

export const offFeatureUpdate = () => {
  if (!socket) return;
  socket.off("feature:update");
};

export const disconnectSocket = () => {
  if (!socket) return;
  socket.disconnect();
  socket = null;
};