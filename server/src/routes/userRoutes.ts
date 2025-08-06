import { Router } from "express";
import { getProfile } from "../controllers/userController";
import { authorize } from "../middlewares/auth-middleware";

const router = Router();

// GET /api/user/profile - Protected route
router.get("/profile", authorize, getProfile);

export default router;
