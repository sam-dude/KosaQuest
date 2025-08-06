import { Router } from "express";
import adminRoutes from "./admin";
import authRoutes from "./authRoutes";
import blockchainRoutes from "./blockchainRoutes";
import nftRoutes from "./nftRoutes";
import quizRoutes from "./quizRoutes";
import storyRoutes from "./storyRoutes";
import userRoutes from "./userRoutes";

const router = Router();

// API Routes
router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/stories", storyRoutes);
router.use("/quiz", quizRoutes);
router.use("/nft", nftRoutes);
router.use("/admin", adminRoutes);
router.use("/blockchain", blockchainRoutes);

export default router;
