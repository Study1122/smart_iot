import { Router } from "express";
import {
  registerDevice,
  getUserDevices,
  getDeviceById,
  addDeviceFeature,
  toggleDeviceFeature,
  updateDeviceFeatureLevel,
  getDeviceCommands,
  reportDeviceState,
  deviceHeartbeat,
  updateDevice,
  deleteDevice,
  getDeviceSecret,
  updateDeviceFeatureMeta,
  deleteDeviceFeature,
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
router.get("/:id/secret", authMiddleware, getDeviceSecret);
router.patch("/:id", authMiddleware, updateDevice);
router.delete("/:id", authMiddleware, deleteDevice);
router.get("/:id", authMiddleware, getDeviceById);
router.post("/:id/features",authMiddleware,addDeviceFeature);
// 💡 FEATURE State (Bulb)
router.patch("/:id/features/:featureId",authMiddleware,
  toggleDeviceFeature);
// 🌀 FEATURE LEVEL (FAN SPEED)
router.patch("/:id/features/:featureId/level",authMiddleware,
  updateDeviceFeatureLevel);
// 🔹 FEATURE MANAGEMENT (USER)
router.patch("/:id/features/:featureId/meta",authMiddleware,
  updateDeviceFeatureMeta
);
router.delete("/:id/features/:featureId",authMiddleware,
  deleteDeviceFeature
);

export default router;