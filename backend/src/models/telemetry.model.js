import mongoose from "mongoose";

const telemetrySchema = new mongoose.Schema(
  {
    device: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
      required: true,
      index: true, // 🔥 important for queries
    },

    temperature: {
      type: Number,
    },

    humidity: {
      type: Number,
    },

    voltage: {
      type: Number,
    },
  },
  { timestamps: true }
);

telemetrySchema.index({ device: 1, createdAt: -1 });

telemetrySchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 30 } // 30 days
);

const Telemetry = mongoose.model("Telemetry", telemetrySchema);
export default Telemetry;