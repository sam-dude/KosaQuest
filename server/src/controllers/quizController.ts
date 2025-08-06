import { Response } from "express";
import Story from "../models/Story";
import User from "../models/User";
import UserProgress from "../models/UserProgress";
import { Request } from "../types";
import { StatusCodes } from "../utils/status-codes";

interface QuizSubmissionRequest {
  storyId: string;
  responses: Array<{
    questionId: string;
    answer: string;
  }>;
}

// POST /api/quiz/submit
export const submitQuiz = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { storyId, responses }: QuizSubmissionRequest = req.body;

    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED.code).json({
        status: StatusCodes.UNAUTHORIZED.description,
        message: "User not authenticated",
      });
      return;
    }

    if (!storyId || !responses || !Array.isArray(responses)) {
      res.status(StatusCodes.BAD_REQUEST.code).json({
        status: StatusCodes.BAD_REQUEST.description,
        message: "Story ID and responses array are required",
      });
      return;
    }

    // Check if user has already completed this story
    const existingProgress = await UserProgress.findOne({ userId, storyId });
    if (existingProgress) {
      res.status(StatusCodes.CONFLICT.code).json({
        status: StatusCodes.CONFLICT.description,
        message: "You have already completed this story",
      });
      return;
    }

    // Get the story and its quizzes
    const story = await Story.findOne({ storyId, isActive: true });
    if (!story) {
      res.status(StatusCodes.NOT_FOUND.code).json({
        status: StatusCodes.NOT_FOUND.description,
        message: "Story not found",
      });
      return;
    }

    // Validate and score the responses
    const quizResponses = [];
    let totalScore = 0;
    let maxScore = 0;

    for (const quiz of story.quizzes) {
      maxScore += quiz.points;

      const userResponse = responses.find(
        (r) => r.questionId === quiz.questionId
      );
      if (!userResponse) {
        quizResponses.push({
          questionId: quiz.questionId,
          answer: "",
          isCorrect: false,
          pointsEarned: 0,
        });
        continue;
      }

      const isCorrect = userResponse.answer === quiz.answer;
      const pointsEarned = isCorrect ? quiz.points : 0;
      totalScore += pointsEarned;

      quizResponses.push({
        questionId: quiz.questionId,
        answer: userResponse.answer,
        isCorrect,
        pointsEarned,
      });
    }

    // Calculate XP earned (base XP + bonus for good performance)
    const scorePercentage = totalScore / maxScore;
    let xpEarned = Math.floor(story.totalXP * scorePercentage);

    // Bonus XP for perfect score
    if (scorePercentage === 1) {
      xpEarned += Math.floor(story.totalXP * 0.2); // 20% bonus
    }

    // Save user progress
    const userProgress = new UserProgress({
      userId,
      storyId,
      quizResponses,
      totalScore,
      maxScore,
      xpEarned,
    });

    await userProgress.save();

    // Update user's total XP
    const user = await User.findById(userId);
    if (user) {
      user.xp += xpEarned;
      await user.save();
    }

    res.status(StatusCodes.OK.code).json({
      status: StatusCodes.OK.description,
      message: "Quiz submitted successfully",
      data: {
        xpEarned,
        totalXP: user?.xp || 0,
        score: totalScore,
        maxScore,
        scorePercentage: Math.round(scorePercentage * 100),
        results: quizResponses,
      },
    });
  } catch (error: any) {
    console.error("Submit quiz error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR.description,
      message: "Internal server error while submitting quiz",
      error: error.message,
    });
  }
};
