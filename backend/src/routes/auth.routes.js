import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { register, login } from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", register);
//test purpose
router.get("/me", authMiddleware, (req, res) => {
  res.json({success: true, user: req.user});
});
router.post("/login", login);

export default router;