import { Router } from "express";
import {
  bulkUploadStories,
  deleteStory,
  getStoriesStats,
  uploadStoriesFromFile,
} from "../controllers/adminController";
import { authorize } from "../middlewares/auth-middleware";

const router = Router();

// Apply authentication middleware to all admin routes
router.use(authorize);

// Stories management endpoints
router.post("/stories/bulk-upload", bulkUploadStories);
router.post("/stories/upload-from-file", uploadStoriesFromFile);
router.get("/stories/stats", getStoriesStats);
router.delete("/stories/:storyId", deleteStory);

export default router;
