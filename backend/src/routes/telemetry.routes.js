import { Router } from "express";
import { createTelemetry } from "../controllers/telemetry.controller.js";
import deviceAuthMiddleware from "../middlewares/deviceAuth.middleware.js";

const router = Router();

// Device → Backend telemetry
router.post("/", deviceAuthMiddleware, createTelemetry);

export default router;