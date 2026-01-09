import dotenv from "dotenv";
dotenv.config();

import {createServer} from "http";
import startDeviceStatusCron from "./utils/deviceStatus.cron.js";
import app from "./app.js";
import { initSocket } from "./socket.js";
import connectDB from "./config/db.js";


connectDB()
const server = createServer(app);

const PORT = process.env.PORT || 5000;

//🔥initiate Socket server
initSocket(server);

server.listen(PORT,"0.0.0.0", ()=>{
  startDeviceStatusCron();
  console.log(`🚀 Server running on port ${PORT}`);
});


/*
  connectDB.then(() => {
    // ✅ start background cron job
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port http://0.0.0.0:${PORT}`);
    });
  })
  .catch(err => {
    console.error("DB connection failed", err);
  });
  
*/