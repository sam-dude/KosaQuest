import express, { NextFunction, Response } from "express";
import { Request } from "../types";
import { verifyToken } from "../utils";
import { StatusCodes } from "../utils/status-codes";

export const authorize: express.RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    res.status(StatusCodes.UNAUTHORIZED.code).json({
      message: "No token provided",
      status: StatusCodes.UNAUTHORIZED.description,
    });
    return;
  } else {
    try {
      const decoded = verifyToken(token);
      req.user = decoded as { id?: string };
      next();
    } catch (error) {
      res.status(StatusCodes.UNAUTHORIZED.code).json({
        message: "Invalid token",
        status: StatusCodes.UNAUTHORIZED.description,
      });
      return;
    }
  }
};
