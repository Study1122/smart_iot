import Device from "../models/device.model.js";
import crypto from "crypto";

/**
 * Register a new device (user action)
 */
export const registerDevice = async (req, res) => {
  try {
    const { name, deviceId } = req.body;

    // check if device already exists
    const existing = await Device.findOne({ deviceId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Device already exists",
      });
    }

    // generate device secret
    const secret = crypto.randomBytes(16).toString("hex");

    const device = await Device.create({
      name,
      deviceId,
      secret,
      owner: req.user._id, // from auth middleware
    });

    res.status(201).json({
      success: true,
      message: "Device registered successfully",
      device,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get all devices for logged-in user
 */
export const getUserDevices = async (req, res) => {
  try {
    const devices = await Device.find({ owner: req.user._id });

    res.status(200).json({
      success: true,
      devices,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//Backend – Get single device by ID 📁 controller
export const getDeviceById = async (req, res) => {
  try {
    const { id } = req.params;

    const device = await Device.findOne({
      _id: id,
      owner: req.user._id,
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Device not found",
      });
    }

    res.status(200).json({
      success: true,
      device,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//add new features
export const addDeviceFeature = async (req, res) => {
  try {
    const { id } = req.params;
    const { featureId, name, type } = req.body;

    const device = await Device.findOne({
      _id: id,
      owner: req.user._id,
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Device not found",
      });
    }

    // ✅ NOW it is safe to check
    const exists = device.features.some(
      (f) => f.featureId === featureId
    );

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "FeatureId must be unique per device",
      });
    }
    
    //GPIO pin features
    const allowedGpios = [0, 2, 4, 5, 12, 13, 14, 15, 16];

    if (gpio !== undefined && !allowedGpios.includes(gpio)) {
      throw new ApiError(400, "Invalid GPIO pin");
    }
    
    // prevent duplicate GPIO per device
    const gpioUsed = device.features.some(
      (f) => f.gpio === gpio && gpio !== null
    );
    
    if (gpioUsed) {
      throw new ApiError(400, "GPIO already in use on this device");
    }

    device.features.push({
      featureId,
      name,
      type,
      desiredState: false,
      reportedState: false,
      gpio,
      lastUpdated: new Date(),
    });

    await device.save();

    res.json({
      success: true,
      message: "Feature added",
      features: device.features,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Toggle feature state (user action)
export const toggleDeviceFeature = async (req, res) => {
  try {
    const { id, featureId } = req.params;
    const { state } = req.body;

    const device = await Device.findOne({
      _id: id,
      owner: req.user._id,
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Device not found",
      });
    }

    const feature = device.features.find(
      (f) => f.featureId === featureId
    );

    if (!feature) {
      return res.status(404).json({
        success: false,
        message: "Feature not found",
      });
    }

    // ✅ update ONLY desiredState
    feature.desiredState = state;
    feature.lastUpdated = new Date();
    
    await device.save();

    res.json({
      success: true,
      message: "Desired state updated",
      feature,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getDeviceCommands = async (req, res) => {
  try {
    const device = req.device;

    res.json({
      success: true,
      commands: 
        
        device.features.map((f) => ({
        
          featureId: f.featureId,
          type: f.type,
          desiredState: f.desiredState,
          reportedState: f.reportedState,
        })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const reportDeviceState = async (req, res) => {
  try {
    const device = req.device;
    const { featureId, state } = req.body;

    const feature = device.features.find(
      (f) => f.featureId === featureId
    );

    if (!feature) {
      return res.status(404).json({
        success: false,
        message: "Feature not found",
      });
    }

    // ✅ device confirms reality
    feature.reportedState = state;
    feature.lastUpdated = new Date();

    await device.save();

    res.json({
      success: true,
      message: "Device state reported",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



export const deviceHeartbeat = async (req, res) => {
  try {
    const device = req.device;

    device.lastSeen = new Date();
    device.status = "online";
    await device.save();

    res.json({
      success: true,
      message: "Heartbeat received",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update device name (user action)
 */
export const updateDevice = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Device name is required",
      });
    }

    const device = await Device.findOne({
      _id: id,
      owner: req.user._id,
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Device not found",
      });
    }

    device.name = name;
    await device.save();

    res.json({
      success: true,
      message: "Device updated successfully",
      device,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete device (user action)
 */
export const deleteDevice = async (req, res) => {
  try {
    const { id } = req.params;

    const device = await Device.findOneAndDelete({
      _id: id,
      owner: req.user._id,
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Device not found",
      });
    }

    res.json({
      success: true,
      message: "Device deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update feature metadata (name/type) – user action
 */
export const updateDeviceFeatureMeta = async (req, res) => {
  try {
    const { id, featureId } = req.params;
    const { name, type } = req.body;

    const device = await Device.findOne({
      _id: id,
      owner: req.user._id,
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Device not found",
      });
    }
    

    const feature = device.features.find(
      (f) => f.featureId === featureId
    );

    
    if (!feature) {
      return res.status(404).json({
        success: false,
        message: "Feature not found",
      });
    }

    if (gpio !== undefined) {
      feature.gpio = gpio;
    }
    
    if (name) feature.name = name;
    if (type) feature.type = type;

    feature.lastUpdated = new Date();
    await device.save();

    res.json({
      success: true,
      message: "Feature updated successfully",
      feature,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete feature – user action
 */
export const deleteDeviceFeature = async (req, res) => {
  try {
    const { id, featureId } = req.params;

    const device = await Device.findOne({
      _id: id,
      owner: req.user._id,
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Device not found",
      });
    }

    const featureExists = device.features.some(
      (f) => f.featureId === featureId
    );

    if (!featureExists) {
      return res.status(404).json({
        success: false,
        message: "Feature not found",
      });
    }

    device.features = device.features.filter(
      (f) => f.featureId !== featureId
    );

    await device.save();

    res.json({
      success: true,
      message: "Feature deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

