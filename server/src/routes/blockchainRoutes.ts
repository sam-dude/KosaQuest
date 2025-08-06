import { Router } from "express";
import {
  connectWallet,
  getNetworkInfo,
  getUserAssets,
  issueCertificate,
  mintStoryBadge,
  testEduChainConnection,
  verifyCertificate,
} from "../controllers/blockchainController";
import { authorize } from "../middlewares/auth-middleware";

const router = Router();

// Public endpoints (no auth required)
router.get("/test", testEduChainConnection);
router.get("/network-info", getNetworkInfo);
router.get("/verify/:tokenId", verifyCertificate);

// Protected endpoints (require authentication)
router.post("/connect-wallet", authorize, connectWallet);
router.post("/mint-badge", authorize, mintStoryBadge);
router.post("/issue-certificate", authorize, issueCertificate);
router.get("/assets/:walletAddress", authorize, getUserAssets);

export default router;
