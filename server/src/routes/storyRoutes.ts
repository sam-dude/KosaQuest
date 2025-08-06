import { Router } from "express";
import { getStories, getStoryById } from "../controllers/storyController";

const router = Router();

// GET /api/stories - Get all stories
router.get("/", getStories);

// GET /api/stories/:storyId - Get specific story
router.get("/:storyId", getStoryById);

export default router;
