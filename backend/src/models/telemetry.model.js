import mongoose from "mongoose";

const telemetrySchema = new mongoose.Schema(
  {
    device: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
      required: true,
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

const Telemetry = mongoose.model("Telemetry", telemetrySchema);
export default Telemetry;