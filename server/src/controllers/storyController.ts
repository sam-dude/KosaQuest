import { Request, Response } from "express";
import Story from "../models/Story";
import { StatusCodes } from "../utils/status-codes";

// GET /api/stories
export const getStories = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { difficulty, language } = req.query;

    // Build filter object
    const filter: any = { isActive: true };

    if (difficulty && typeof difficulty === "string") {
      filter.difficulty = difficulty;
    }

    if (language && typeof language === "string") {
      filter.language = language;
    }

    const stories = await Story.find(filter).select(
      "storyId title description language difficulty totalXP"
    );

    res.status(StatusCodes.OK.code).json({
      status: StatusCodes.OK.description,
      message: "Stories retrieved successfully",
      data: {
        stories: stories.map((story) => ({
          storyId: story.storyId,
          title: story.title,
          description: story.description,
          language: story.language,
          difficulty: story.difficulty,
          totalXP: story.totalXP,
        })),
        count: stories.length,
      },
    });
  } catch (error: any) {
    console.error("Get stories error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR.description,
      message: "Internal server error while fetching stories",
      error: error.message,
    });
  }
};

// GET /api/story/:storyId
export const getStoryById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { storyId } = req.params;

    if (!storyId) {
      res.status(StatusCodes.BAD_REQUEST.code).json({
        status: StatusCodes.BAD_REQUEST.description,
        message: "Story ID is required",
      });
      return;
    }

    const story = await Story.findOne({ storyId, isActive: true });

    if (!story) {
      res.status(StatusCodes.NOT_FOUND.code).json({
        status: StatusCodes.NOT_FOUND.description,
        message: "Story not found",
      });
      return;
    }

    res.status(StatusCodes.OK.code).json({
      status: StatusCodes.OK.description,
      message: "Story retrieved successfully",
      data: {
        storyId: story.storyId,
        title: story.title,
        description: story.description,
        language: story.language,
        difficulty: story.difficulty,
        pages: story.pages.map((page) => ({
          pageNo: page.pageNo,
          english: page.english,
          native: page.native,
        })),
        quizzes: story.quizzes.map((quiz) => ({
          questionId: quiz.questionId,
          question: quiz.question,
          options: quiz.options,
          answer: quiz.answer, // In production, you might want to exclude this
        })),
        totalXP: story.totalXP,
      },
    });
  } catch (error: any) {
    console.error("Get story by ID error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR.description,
      message: "Internal server error while fetching story",
      error: error.message,
    });
  }
};
