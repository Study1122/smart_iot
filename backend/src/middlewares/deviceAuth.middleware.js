import Device from "../models/device.model.js";

const deviceAuthMiddleware = async (req, res, next) => {
  try {
    const deviceId = req.headers["x-device-id"];
    const secret = req.headers["x-device-secret"];

    if (!deviceId || !secret) {
      return res.status(401).json({
        success: false,
        message: "Device credentials missing",
      });
    }

    const device = await Device.findOne({ deviceId });

    if (!device || device.secret !== secret) {
      return res.status(401).json({
        success: false,
        message: "Invalid device credentials",
      });
    }

    // attach device to request
    req.device = device;

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default deviceAuthMiddleware;
