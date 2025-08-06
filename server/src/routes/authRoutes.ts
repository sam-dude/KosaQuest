import { Router } from "express";
import { login, register, verifyEmail } from "../controllers/authController";

const router = Router();

// POST /api/auth/register
router.post("/register", register);

// POST /api/auth/login
router.post("/login", login);

// POST /api/auth/verify-email
router.post("/verify-email", verifyEmail);

export default router;
