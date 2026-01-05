import Telemetry from "../models/telemetry.model.js";
import Device from "../models/device.model.js";

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

