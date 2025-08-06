import { Request, Response } from "express";
import { eduChainService } from "../services/educhain";
import { StatusCodes } from "../utils/status-codes";

export const testEduChainConnection = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const connectionTest = await eduChainService.testConnection();

    res.status(StatusCodes.OK.code).json({
      status: StatusCodes.OK.description,
      message: "EDUCHAIN connection test completed",
      data: connectionTest,
    });
  } catch (error: any) {
    console.error("EDUCHAIN connection test error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR.description,
      message: "Failed to test EDUCHAIN connection",
      error: error.message,
    });
  }
};

export const getNetworkInfo = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const networkInfo = eduChainService.getNetworkInfo();

    res.status(StatusCodes.OK.code).json({
      status: StatusCodes.OK.description,
      message: "Network information retrieved successfully",
      data: networkInfo,
    });
  } catch (error: any) {
    console.error("Get network info error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR.description,
      message: "Failed to get network information",
      error: error.message,
    });
  }
};

export const connectWallet = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      res.status(StatusCodes.BAD_REQUEST.code).json({
        status: StatusCodes.BAD_REQUEST.description,
        message: "Wallet address is required",
      });
      return;
    }

    res.status(StatusCodes.OK.code).json({
      status: StatusCodes.OK.description,
      message: "Wallet connected successfully",
      data: {
        walletAddress,
        network: eduChainService.getNetworkInfo().name,
      },
    });
  } catch (error: any) {
    console.error("Connect wallet error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR.description,
      message: "Failed to connect wallet",
      error: error.message,
    });
  }
};

export const mintStoryBadge = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { walletAddress, storyId, language, difficulty } = req.body;

    if (!walletAddress || !storyId) {
      res.status(StatusCodes.BAD_REQUEST.code).json({
        status: StatusCodes.BAD_REQUEST.description,
        message: "Wallet address and story ID are required",
      });
      return;
    }

    const badgeMetadata = {
      name: `${language || "Story"} Completion Badge`,
      description: `Successfully completed story: ${storyId}`,
      image: `https://kosaquest.com/badges/${
        language || "general"
      }-completion.png`,
      attributes: [
        { trait_type: "Story ID", value: storyId },
        { trait_type: "Language", value: language || "Unknown" },
        { trait_type: "Difficulty", value: difficulty || "Unknown" },
        { trait_type: "Platform", value: "Kosa Quest" },
        { trait_type: "Type", value: "Story Completion" },
        { trait_type: "Completion Date", value: new Date().toISOString() },
      ],
    };

    const result = await eduChainService.mintEducationalBadge(
      walletAddress,
      `STORY_COMPLETION_${storyId}`,
      badgeMetadata
    );

    res.status(StatusCodes.CREATED.code).json({
      status: StatusCodes.CREATED.description,
      message: "Story completion badge minted successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Mint story badge error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR.description,
      message: "Failed to mint story badge",
      error: error.message,
    });
  }
};

export const issueCertificate = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { walletAddress, courseId, grade } = req.body;

    if (!walletAddress || !courseId || grade === undefined) {
      res.status(StatusCodes.BAD_REQUEST.code).json({
        status: StatusCodes.BAD_REQUEST.description,
        message: "Wallet address, course ID, and grade are required",
      });
      return;
    }

    const result = await eduChainService.issueCertificate(
      walletAddress,
      courseId,
      grade,
      new Date()
    );

    res.status(StatusCodes.CREATED.code).json({
      status: StatusCodes.CREATED.description,
      message: "Certificate issued successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Issue certificate error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR.description,
      message: "Failed to issue certificate",
      error: error.message,
    });
  }
};

export const getUserAssets = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { walletAddress } = req.params;

    if (!walletAddress) {
      res.status(StatusCodes.BAD_REQUEST.code).json({
        status: StatusCodes.BAD_REQUEST.description,
        message: "Wallet address is required",
      });
      return;
    }

    const assets = await eduChainService.getUserEducationalAssets(
      walletAddress
    );

    res.status(StatusCodes.OK.code).json({
      status: StatusCodes.OK.description,
      message: "User educational assets retrieved successfully",
      data: assets,
    });
  } catch (error: any) {
    console.error("Get user assets error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR.description,
      message: "Failed to get user educational assets",
      error: error.message,
    });
  }
};

export const verifyCertificate = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { tokenId } = req.params;

    if (!tokenId) {
      res.status(StatusCodes.BAD_REQUEST.code).json({
        status: StatusCodes.BAD_REQUEST.description,
        message: "Token ID is required",
      });
      return;
    }

    const verification = await eduChainService.verifyCertificate(tokenId);

    const statusCode = verification.isValid
      ? StatusCodes.OK
      : StatusCodes.NOT_FOUND;

    res.status(statusCode.code).json({
      status: statusCode.description,
      message: verification.isValid
        ? "Certificate verified successfully"
        : "Certificate not found or invalid",
      data: verification,
    });
  } catch (error: any) {
    console.error("Verify certificate error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR.description,
      message: "Failed to verify certificate",
      error: error.message,
    });
  }
};
