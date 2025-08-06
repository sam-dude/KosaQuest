import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "path";
import connectDB from "./config/mongodb";
import apiRoutes from "./routes";
import { StatusCodes } from "./utils/status-codes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "../public")));

connectDB();

// API Documentation route
app.get("/docs", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/docs.html"));
});

// API Routes
app.use("/api", apiRoutes);

app.get("/", (req, res) => {
  const now = new Date();
  const friendlyDate = now.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const friendlyTime = now.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
  res.status(StatusCodes.OK.code).json({
    status: StatusCodes.OK.description,
    message: `Kosa Quest Server is up and running as of ${friendlyDate} at ${friendlyTime}`,
    documentation: `http://localhost:${PORT}/docs`,
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(StatusCodes.NOT_FOUND.code).json({
    status: StatusCodes.NOT_FOUND.description,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use(
  (
    error: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Global error handler:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR.code).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR.description,
      message: "Something went wrong!",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
);

app.listen(PORT, () => {
  console.log(`🚀 Kosa Quest Server is running on port ${PORT}`);
  console.log(
    `📖 API Documentation available at http://localhost:${PORT}/docs`
  );
});
