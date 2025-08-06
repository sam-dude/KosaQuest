import { Router } from "express";
import {
  checkBadgeEligibility,
  getMyBadges,
  mintNFTBadge,
} from "../controllers/nftController";
import { authorize } from "../middlewares/auth-middleware";

const router = Router();

// POST /api/nft/mint - Protected route
router.post("/mint", authorize, mintNFTBadge);

// GET /api/nft/my-badges - Protected route
router.get("/my-badges", authorize, getMyBadges);

// GET /api/nft/check-eligibility - Protected route
router.get("/check-eligibility", authorize, checkBadgeEligibility);

export default router;
