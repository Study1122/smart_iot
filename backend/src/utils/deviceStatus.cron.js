import cron from "node-cron";
import Device from "../models/device.model.js";
import { isDeviceOnline } from "./isDeviceOnline.js";

const startDeviceStatusCron = () => {
  cron.schedule("*/30 * * * * *", async () => {
    try {
      const devices = await Device.find();

      for (const device of devices) {
        const online = isDeviceOnline(device.lastSeen);

        const newStatus = online ? "online" : "offline";

        if (device.status !== newStatus) {
          device.status = newStatus;
          await device.save();
        }
      }
    } catch (error) {
      console.error("Device status cron error:", error.message);
    }
  });

  console.log("Device status cron started");
};

export default startDeviceStatusCron;