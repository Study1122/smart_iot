import { Router } from "express";
import {
  registerDevice,
  getUserDevices,
  getDeviceById,
  addDeviceFeature,
  toggleDeviceFeature,
  getDeviceCommands,
  reportDeviceState,
  deviceHeartbeat
} from "../controllers/device.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import deviceAuthMiddleware from "../middlewares/deviceAuth.middleware.js";

const router = Router();

router.post("/ping", deviceAuthMiddleware, (req, res) => {
  res.json({
    success: true,
    message: "Device authenticated",
    device: req.device.deviceId,
  });
});

router.get("/commands",
  deviceAuthMiddleware,
  getDeviceCommands );
  
router.post("/report",
  deviceAuthMiddleware,
  reportDeviceState);

//
router.post("/heartbeat", deviceAuthMiddleware,
  deviceHeartbeat
);
router.post("/", authMiddleware, registerDevice);
router.get("/", authMiddleware, getUserDevices);
router.get("/:id", authMiddleware, getDeviceById);
router.post("/:id/features",authMiddleware,addDeviceFeature);
router.patch("/:id/features/:featureId",authMiddleware,
  toggleDeviceFeature);

export default router;