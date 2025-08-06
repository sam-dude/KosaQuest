import { Request, Response } from "express";
import User from "../models/User";
import { sendVerificationEmail } from "../services/email";
import {
  comparePassword,
  generateOtp,
  generateToken,
  hashPassword,
} from "../utils";
import { StatusCodes } from "../utils/status-codes";

// POST /api/auth/register
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      res.status(StatusCodes.BAD_REQUEST.code).json({
        status: StatusCodes.BAD_REQUEST.description,
        message: "Name, email, and password are required",
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(StatusCodes.CONFLICT.code).json({
        status: StatusCodes.CONFLICT.description,
        message: "User with this email already exists",
      });
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate verification code
    const verificationCode = generateOtp();

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      verificationCode,
      isEmailVerified: false,
    });

    await user.save();

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationCode);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Continue with registration even if email fails
    }

    // Generate JWT token

    res.status(StatusCodes.CREATED.code).json({
      status: StatusCodes.CREATED.description,
      message: "User registered successfully. Please verify your email.",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          xp: user.xp,
          isEmailVerified: user.isEmailVerified,
        },
      },
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR.description,
      message: "Internal server error during registration",
      error: error.message,
    });
  }
};

// POST /api/auth/login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(StatusCodes.BAD_REQUEST.code).json({
        status: StatusCodes.BAD_REQUEST.description,
        message: "Email and password are required",
      });
      return;
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      res.status(StatusCodes.UNAUTHORIZED.code).json({
        status: StatusCodes.UNAUTHORIZED.description,
        message: "Invalid email or password",
      });
      return;
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      res.status(StatusCodes.UNAUTHORIZED.code).json({
        status: StatusCodes.UNAUTHORIZED.description,
        message: "Invalid email or password",
      });
      return;
    }

    // Generate JWT token
    const token = generateToken((user._id as any).toString(), user.email);

    res.status(StatusCodes.OK.code).json({
      status: StatusCodes.OK.description,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          xp: user.xp,
          isEmailVerified: user.isEmailVerified,
        },
        token,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR.description,
      message: "Internal server error during login",
      error: error.message,
    });
  }
};

// POST /api/auth/verify-email
export const verifyEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, verificationCode } = req.body;

    if (!email || !verificationCode) {
      res.status(StatusCodes.BAD_REQUEST.code).json({
        status: StatusCodes.BAD_REQUEST.description,
        message: "Email and verification code are required",
      });
      return;
    }

    const user = await User.findOne({
      email,
      verificationCode,
    }).select("+verificationCode");

    if (!user) {
      res.status(StatusCodes.BAD_REQUEST.code).json({
        status: StatusCodes.BAD_REQUEST.description,
        message: "Invalid verification code",
      });
      return;
    }

    user.isEmailVerified = true;
    user.verificationCode = undefined;
    await user.save();

    res.status(StatusCodes.OK.code).json({
      status: StatusCodes.OK.description,
      message: "Email verified successfully",
    });
  } catch (error: any) {
    console.error("Email verification error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR.description,
      message: "Internal server error during email verification",
      error: error.message,
    });
  }
};
