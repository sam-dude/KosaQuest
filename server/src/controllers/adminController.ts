import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import Story from "../models/Story";
import { StatusCodes } from "../utils/status-codes";

export const bulkUploadStories = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { stories } = req.body;

    if (!stories || !Array.isArray(stories)) {
      res.status(StatusCodes.BAD_REQUEST.code).json({
        status: StatusCodes.BAD_REQUEST.description,
        message: "Stories array is required",
      });
      return;
    }

    const processedStories = [];
    const errors = [];

    for (let i = 0; i < stories.length; i++) {
      try {
        const storyData = stories[i];

        if (!storyData.storyId) {
          storyData.storyId = storyData.story_id || `story_${Date.now()}_${i}`;
        }

        const pages: { pageNo: number; english: string; native: string }[] = [];
        if (storyData.story_content) {
          const contentChunks = splitContentIntoPages(storyData.story_content);
          contentChunks.forEach((chunk, index) => {
            pages.push({
              pageNo: index + 1,
              english:
                storyData.translated_title || storyData.title || "Untitled",
              native: chunk,
            });
          });
        }

        const quizzes = generateBasicQuizzes(storyData);

        const storyToSave = {
          storyId: storyData.storyId,
          title: storyData.title || storyData.translated_title || "Untitled",
          description:
            storyData.moral ||
            storyData.description ||
            "No description available",
          language: storyData.language || storyData.culture || "Unknown",
          difficulty: determineDifficulty(storyData),
          pages,
          quizzes,
          totalXP: calculateXP(storyData),
          isActive: true,
          metadata: {
            source: storyData.source || storyData.source_url || "Unknown",
            region: storyData.region || "Unknown",
            culture: storyData.culture || "Unknown",
            audience: storyData.audience || "All ages",
            collection: storyData.collection || "General",
            themes: storyData.themes || [],
            author: storyData.author || "Unknown",
            createdAt:
              storyData.created_at || storyData.scraped_at || new Date(),
          },
        };

        const savedStory = await Story.create(storyToSave);
        processedStories.push(savedStory.storyId);
      } catch (storyError: any) {
        errors.push({
          index: i,
          error: storyError.message,
          story: stories[i]?.title || `Story at index ${i}`,
        });
      }
    }

    res.status(StatusCodes.CREATED.code).json({
      status: StatusCodes.CREATED.description,
      message: "Bulk upload completed",
      data: {
        successfulUploads: processedStories.length,
        totalAttempted: stories.length,
        processedStories,
        errors: errors.length > 0 ? errors : undefined,
      },
    });
  } catch (error: any) {
    console.error("Bulk upload stories error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR.description,
      message: "Internal server error during bulk upload",
      error: error.message,
    });
  }
};

export const uploadStoriesFromFile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { fileName } = req.body;

    if (!fileName) {
      res.status(StatusCodes.BAD_REQUEST.code).json({
        status: StatusCodes.BAD_REQUEST.description,
        message: "fileName is required",
      });
      return;
    }

    const filePath = path.join(process.cwd(), fileName);

    if (!fs.existsSync(filePath)) {
      res.status(StatusCodes.NOT_FOUND.code).json({
        status: StatusCodes.NOT_FOUND.description,
        message: `File not found: ${fileName}`,
      });
      return;
    }

    const fileContent = fs.readFileSync(filePath, "utf8");
    let stories;

    try {
      stories = JSON.parse(fileContent);
    } catch (parseError) {
      res.status(StatusCodes.BAD_REQUEST.code).json({
        status: StatusCodes.BAD_REQUEST.description,
        message: "Invalid JSON format in file",
        error: parseError,
      });
      return;
    }

    if (!Array.isArray(stories)) {
      res.status(StatusCodes.BAD_REQUEST.code).json({
        status: StatusCodes.BAD_REQUEST.description,
        message: "File must contain an array of stories",
      });
      return;
    }

    const processedStories = [];
    const errors = [];

    for (let i = 0; i < stories.length; i++) {
      try {
        const storyData = stories[i];

        if (!storyData.storyId) {
          storyData.storyId =
            storyData.story_id || `${fileName.replace(".json", "")}_${i + 1}`;
        }

        const existingStory = await Story.findOne({
          storyId: storyData.storyId,
        });
        if (existingStory) {
          errors.push({
            index: i,
            error: "Story already exists",
            story: storyData.title || storyData.storyId,
          });
          continue;
        }

        const pages: { pageNo: number; english: string; native: string }[] = [];
        if (storyData.story_content) {
          const contentChunks = splitContentIntoPages(storyData.story_content);
          contentChunks.forEach((chunk, index) => {
            pages.push({
              pageNo: index + 1,
              english:
                storyData.translated_title || storyData.title || "Untitled",
              native: chunk,
            });
          });
        }

        const quizzes = generateBasicQuizzes(storyData);

        const storyToSave = {
          storyId: storyData.storyId,
          title: storyData.title || storyData.translated_title || "Untitled",
          description:
            storyData.moral ||
            storyData.description ||
            "No description available",
          language: storyData.language || storyData.culture || "Unknown",
          difficulty: determineDifficulty(storyData),
          pages,
          quizzes,
          totalXP: calculateXP(storyData),
          isActive: true,
          metadata: {
            source: storyData.source || storyData.source_url || "Unknown",
            region: storyData.region || "Unknown",
            culture: storyData.culture || "Unknown",
            audience: storyData.audience || "All ages",
            collection: storyData.collection || fileName.replace(".json", ""),
            themes: storyData.themes || [],
            author: storyData.author || "Unknown",
            createdAt:
              storyData.created_at || storyData.scraped_at || new Date(),
          },
        };

        const savedStory = await Story.create(storyToSave);
        processedStories.push(savedStory.storyId);
      } catch (storyError: any) {
        errors.push({
          index: i,
          error: storyError.message,
          story: stories[i]?.title || `Story at index ${i}`,
        });
      }
    }

    res.status(StatusCodes.CREATED.code).json({
      status: StatusCodes.CREATED.description,
      message: `Stories uploaded from ${fileName}`,
      data: {
        fileName,
        successfulUploads: processedStories.length,
        totalAttempted: stories.length,
        processedStories,
        errors: errors.length > 0 ? errors : undefined,
      },
    });
  } catch (error: any) {
    console.error("Upload from file error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR.description,
      message: "Internal server error during file upload",
      error: error.message,
    });
  }
};

export const getStoriesStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const totalStories = await Story.countDocuments();
    const activeStories = await Story.countDocuments({ isActive: true });
    const inactiveStories = await Story.countDocuments({ isActive: false });

    const languageStats = await Story.aggregate([
      { $group: { _id: "$language", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const difficultyStats = await Story.aggregate([
      { $group: { _id: "$difficulty", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const recentStories = await Story.find()
      .select("storyId title language createdAt")
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(StatusCodes.OK.code).json({
      status: StatusCodes.OK.description,
      message: "Stories statistics retrieved successfully",
      data: {
        total: totalStories,
        active: activeStories,
        inactive: inactiveStories,
        languageDistribution: languageStats,
        difficultyDistribution: difficultyStats,
        recentStories,
      },
    });
  } catch (error: any) {
    console.error("Get stories stats error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR.description,
      message: "Internal server error while fetching statistics",
      error: error.message,
    });
  }
};

export const deleteStory = async (
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

    const deletedStory = await Story.findOneAndDelete({ storyId });

    if (!deletedStory) {
      res.status(StatusCodes.NOT_FOUND.code).json({
        status: StatusCodes.NOT_FOUND.description,
        message: "Story not found",
      });
      return;
    }

    res.status(StatusCodes.OK.code).json({
      status: StatusCodes.OK.description,
      message: "Story deleted successfully",
      data: {
        deletedStory: {
          storyId: deletedStory.storyId,
          title: deletedStory.title,
        },
      },
    });
  } catch (error: any) {
    console.error("Delete story error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR.description,
      message: "Internal server error while deleting story",
      error: error.message,
    });
  }
};

function splitContentIntoPages(
  content: string,
  maxCharsPerPage: number = 500
): string[] {
  const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const pages = [];
  let currentPage = "";

  for (const sentence of sentences) {
    if (
      currentPage.length + sentence.length > maxCharsPerPage &&
      currentPage.length > 0
    ) {
      pages.push(currentPage.trim());
      currentPage = sentence.trim() + ".";
    } else {
      currentPage +=
        (currentPage.length > 0 ? " " : "") + sentence.trim() + ".";
    }
  }

  if (currentPage.trim().length > 0) {
    pages.push(currentPage.trim());
  }

  return pages.length > 0 ? pages : [content];
}

function generateBasicQuizzes(storyData: any): any[] {
  const quizzes = [];
  const title = storyData.title || storyData.translated_title || "Untitled";
  const moral = storyData.moral || "";
  const themes = storyData.themes || [];

  quizzes.push({
    questionId: `${storyData.storyId || "story"}_q1`,
    question: `What is the main title of this story?`,
    options: [title, "Unknown Story", "Traditional Tale", "Folk Story"],
    answer: title,
    points: 10,
  });

  if (moral) {
    quizzes.push({
      questionId: `${storyData.storyId || "story"}_q2`,
      question: `What is the main moral of this story?`,
      options: [moral, "Always be honest", "Work hard", "Be kind to others"],
      answer: moral,
      points: 15,
    });
  }

  quizzes.push({
    questionId: `${storyData.storyId || "story"}_q3`,
    question: `This story originates from which culture?`,
    options: [
      storyData.culture || storyData.language || "Unknown",
      "English",
      "French",
      "Spanish",
    ],
    answer: storyData.culture || storyData.language || "Unknown",
    points: 5,
  });

  return quizzes;
}

function determineDifficulty(
  storyData: any
): "beginner" | "intermediate" | "advanced" {
  const content = storyData.story_content || "";
  const contentLength = content.length;

  if (contentLength < 500) return "beginner";
  if (contentLength < 1500) return "intermediate";
  return "advanced";
}

function calculateXP(storyData: any): number {
  const baseXP = 50;
  const content = storyData.story_content || "";
  const lengthBonus = Math.floor(content.length / 100) * 5;
  const themeBonus = (storyData.themes?.length || 0) * 10;

  return baseXP + lengthBonus + themeBonus;
}
