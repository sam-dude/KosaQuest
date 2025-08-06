import { Response } from "express";
import User from "../models/User";
import { Request } from "../types";
import { StatusCodes } from "../utils/status-codes";

// GET /api/user/profile
export const getProfile = async (
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

    const user = await User.findById(userId).select("-password");

    if (!user) {
      res.status(StatusCodes.NOT_FOUND.code).json({
        status: StatusCodes.NOT_FOUND.description,
        message: "User not found",
      });
      return;
    }

    res.status(StatusCodes.OK.code).json({
      status: StatusCodes.OK.description,
      message: "Profile retrieved successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          xp: user.xp,
          isEmailVerified: user.isEmailVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error: any) {
    console.error("Get profile error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR.description,
      message: "Internal server error while fetching profile",
      error: error.message,
    });
  }
};
