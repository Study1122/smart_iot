import Telemetry from "../models/telemetry.model.js";
import Device from "../models/device.model.js";

/* ===============================
   CREATE (already exists)
================================ */
export const createTelemetry = async (req, res) => {
  try {
    const device = req.device; // from deviceAuth middleware
    const { temperature, humidity, voltage } = req.body;

    // Save telemetry
    const telemetry = await Telemetry.create({
      device: device._id,
      temperature,
      humidity,
      voltage,
    });

    // Update device heartbeat
    device.lastSeen = new Date();
    device.status = "online";
    await device.save();

    res.status(201).json({
      success: true,
      message: "Telemetry received",
      telemetry,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===============================
   GET LATEST TELEMETRY
================================ */
export const getLatestTelemetry = async (req, res) => {
  try {
    const { deviceId } = req.params;
    
    // 1️⃣ Ensure device belongs to user
    const device = await Device.findOne({
      _id: deviceId,
      owner: req.user._id,
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Device not found or unauthorized",
      });
    }

    const telemetry = await Telemetry.findOne({ device: deviceId })
      .sort({ createdAt: -1 });

    if (!telemetry) {
      return res.status(404).json({
        success: false,
        message: "No telemetry found",
      });
    }

    res.json({
      success: true,
      telemetry,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===============================
   GET TELEMETRY HISTORY
================================ */

export const getTelemetryHistory = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const limit = Number(req.query.limit) || 100;

    // 1️⃣ Ensure device belongs to user
    const device = await Device.findOne({
      _id: deviceId,
      owner: req.user._id,
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Device not found or unauthorized",
      });
    }

    // 2️⃣ Fetch history
    const telemetry = await Telemetry.find({ device: device._id })
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({
      success: true,
      count: telemetry.length,
      telemetry,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

