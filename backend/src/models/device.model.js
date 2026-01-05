import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    deviceId: {
      type: String,
      required: true,
      unique: true,
    },

    secret: {
      type: String,
      required: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["online", "offline"],
      default: "offline",
    },

    lastSeen: {
      type: Date,
    },
    features: [
      {
        _id: false,
        
        featureId: {
          type: String, // e.g. bulb1, fan1
          required: true,
        },
        name: {
          type: String, // Bulb / Fan / AC
          required: true,
        },
        type: {
          type: String,
          enum: ["bulb", "fan", "switch"],
          required: true,
        },
        // what user wants
        desiredState: {
          type: Boolean,
          default: false,
        },
    
        // what device has actually done
        reportedState: {
          type: Boolean,
          default: false,
        },
        lastUpdated: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

const Device = mongoose.model("Device", deviceSchema);
export default Device;