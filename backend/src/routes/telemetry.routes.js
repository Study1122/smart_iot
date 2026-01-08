import { Router } from "express";
import {
  createTelemetry,
  getLatestTelemetry,
  getTelemetryHistory,
} from "../controllers/telemetry.controller.js";

import deviceAuthMiddleware from "../middlewares/deviceAuth.middleware.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = Router();

// Device → Backend (WRITE)
router.post("/", deviceAuthMiddleware, createTelemetry);

// User → Backend (READ)
router.get("/:deviceId/latest", authMiddleware, getLatestTelemetry);
router.get("/:deviceId/history", authMiddleware, getTelemetryHistory);

export default router;