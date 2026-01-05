import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Smart IoT Backend Running 🚀" });
});

//user routes
app.use("/auth", authRoutes);

export default app;