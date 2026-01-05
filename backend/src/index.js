import dotenv from "dotenv";
import startDeviceStatusCron from "./utils/deviceStatus.cron.js";
import app from "./app.js";
import connectDB from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    // ✅ start background cron job
    startDeviceStatusCron();
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port http://0.0.0.0:${PORT}`);
    });
  })
  .catch(err => {
    console.error("DB connection failed", err);
  });
  
