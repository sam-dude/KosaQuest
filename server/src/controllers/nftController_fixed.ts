import { Response } from "express";
import NFTBadge from "../models/NFTBadge";
import User from "../models/User";
import { Request } from "../types";
import { StatusCodes } from "../utils/status-codes";

// Define badge type enum
type BadgeType =
  | "proverb_apprentice"
  | "story_master"
  | "quiz_champion"
  | "language_explorer";

// Badge types and their requirements
const BADGE_TYPES: Record<
  BadgeType,
  {
    name: string;
    description: string;
    xpRequired: number;
    imageUrl: string;
  }
> = {
  proverb_apprentice: {
    name: "Proverb Apprentice",
    description: "Completed your first story and earned your first XP",
    xpRequired: 1,
    imageUrl: "https://example.com/badges/proverb-apprentice.png",
  },
  story_master: {
    name: "Story Master",
    description: "Completed 10 stories with excellence",
    xpRequired: 500,
    imageUrl: "https://example.com/badges/story-master.png",
  },
  quiz_champion: {
    name: "Quiz Champion",
    description: "Achieved perfect scores on 5 quizzes",
    xpRequired: 250,
    imageUrl: "https://example.com/badges/quiz-champion.png",
  },
  language_explorer: {
    name: "Language Explorer",
    description: "Explored stories in multiple languages",
    xpRequired: 1000,
    imageUrl: "https://example.com/badges/language-explorer.png",
  },
};

// POST /api/nft/mint
export const mintNFTBadge = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { badgeType = "proverb_apprentice" } = req.body;

    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED.code).json({
        status: StatusCodes.UNAUTHORIZED.description,
        message: "User not authenticated",
      });
      return;
    }

    // Validate badge type
    if (!Object.keys(BADGE_TYPES).includes(badgeType)) {
      res.status(StatusCodes.BAD_REQUEST.code).json({
        status: StatusCodes.BAD_REQUEST.description,
        message: "Invalid badge type",
      });
      return;
    }

    const typedBadgeType = badgeType as BadgeType;

    // Check if user already has this badge
    const existingBadge = await NFTBadge.findOne({
      userId,
      badgeType: typedBadgeType,
    });
    if (existingBadge) {
      res.status(StatusCodes.CONFLICT.code).json({
        status: StatusCodes.CONFLICT.description,
        message: "Badge already minted for this user",
        data: {
          badgeLink: existingBadge.badgeLink,
          txHash: existingBadge.txHash,
        },
      });
      return;
    }

    // Get user and check XP requirement
    const user = await User.findById(userId);
    if (!user) {
      res.status(StatusCodes.NOT_FOUND.code).json({
        status: StatusCodes.NOT_FOUND.description,
        message: "User not found",
      });
      return;
    }

    const badgeConfig = BADGE_TYPES[typedBadgeType];
    if (user.xp < badgeConfig.xpRequired) {
      res.status(StatusCodes.BAD_REQUEST.code).json({
        status: StatusCodes.BAD_REQUEST.description,
        message: `Insufficient XP. Required: ${badgeConfig.xpRequired}, Current: ${user.xp}`,
      });
      return;
    }

    // Simulate NFT minting (In production, this would interact with blockchain)
    const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
    const badgeLink = `https://opensea.io/assets/kosa-quest/${typedBadgeType}-${userId}`;

    // Create NFT badge record
    const nftBadge = new NFTBadge({
      userId,
      badgeName: badgeConfig.name,
      badgeType: typedBadgeType,
      description: badgeConfig.description,
      imageUrl: badgeConfig.imageUrl,
      badgeLink,
      txHash,
      xpRequired: badgeConfig.xpRequired,
    });

    await nftBadge.save();

    res.status(StatusCodes.CREATED.code).json({
      status: StatusCodes.CREATED.description,
      message: "NFT badge minted successfully",
      data: {
        badgeLink,
        txHash,
        badge: {
          id: nftBadge._id,
          name: nftBadge.badgeName,
          type: nftBadge.badgeType,
          description: nftBadge.description,
          imageUrl: nftBadge.imageUrl,
          issuedAt: nftBadge.issuedAt,
        },
      },
    });
  } catch (error: any) {
    console.error("Mint NFT badge error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR.description,
      message: "Internal server error while minting NFT badge",
      error: error.message,
    });
  }
};

// GET /api/nft/my-badges
export const getMyBadges = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED.code).json({
        status: StatusCodes.UNAUTHORIZED.description,
        message: "User not authenticated",
      });
      return;
    }

    const badges = await NFTBadge.find({ userId }).sort({ issuedAt: -1 });

    res.status(StatusCodes.OK.code).json({
      status: StatusCodes.OK.description,
      message: "Badges retrieved successfully",
      data: {
        badges: badges.map((badge) => ({
          id: badge._id,
          name: badge.badgeName,
          type: badge.badgeType,
          description: badge.description,
          imageUrl: badge.imageUrl,
          badgeLink: badge.badgeLink,
          txHash: badge.txHash,
          issuedAt: badge.issuedAt,
        })),
        count: badges.length,
      },
    });
  } catch (error: any) {
    console.error("Get my badges error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR.description,
      message: "Internal server error while fetching badges",
      error: error.message,
    });
  }
};

// GET /api/nft/check-eligibility
export const checkBadgeEligibility = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED.code).json({
        status: StatusCodes.UNAUTHORIZED.description,
        message: "User not authenticated",
      });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(StatusCodes.NOT_FOUND.code).json({
        status: StatusCodes.NOT_FOUND.description,
        message: "User not found",
      });
      return;
    }

    const eligibleBadges = [];
    const existingBadges = await NFTBadge.find({ userId });
    const existingBadgeTypes = existingBadges.map((b) => b.badgeType);

    for (const badgeType of Object.keys(BADGE_TYPES) as BadgeType[]) {
      const config = BADGE_TYPES[badgeType];
      if (
        !existingBadgeTypes.includes(badgeType) &&
        user.xp >= config.xpRequired
      ) {
        eligibleBadges.push({
          type: badgeType,
          name: config.name,
          description: config.description,
          xpRequired: config.xpRequired,
        });
      }
    }

    res.status(StatusCodes.OK.code).json({
      status: StatusCodes.OK.description,
      message: "Badge eligibility checked successfully",
      data: {
        eligibleBadges,
        userXP: user.xp,
      },
    });
  } catch (error: any) {
    console.error("Check badge eligibility error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR.description,
      message: "Internal server error while checking badge eligibility",
      error: error.message,
    });
  }
};
