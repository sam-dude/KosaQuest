import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    await mongoose
      .connect(MONGO_URI as string)
      .then(() => {
        console.log("Connected to MongoDB");
      })
      .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
      });
  } catch (error) {
    console.error("Unexpected error connecting to MongoDB:", error);
  }
};

export default connectDB;
