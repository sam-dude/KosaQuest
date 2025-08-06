import { Router } from "express";
import { submitQuiz } from "../controllers/quizController";
import { authorize } from "../middlewares/auth-middleware";

const router = Router();

// POST /api/quiz/submit - Protected route
router.post("/submit", authorize, submitQuiz);

export default router;
