import mongoose, { Document, Schema } from "mongoose";

export interface IQuizResponse {
  questionId: string;
  answer: string;
  isCorrect: boolean;
  pointsEarned: number;
}

export interface IUserProgress extends Document {
  userId: mongoose.Types.ObjectId;
  storyId: string;
  completedAt: Date;
  quizResponses: IQuizResponse[];
  totalScore: number;
  maxScore: number;
  xpEarned: number;
  createdAt: Date;
  updatedAt: Date;
}

const QuizResponseSchema: Schema = new Schema({
  questionId: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  isCorrect: {
    type: Boolean,
    required: true,
  },
  pointsEarned: {
    type: Number,
    required: true,
    min: 0,
  },
});

const UserProgressSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    storyId: {
      type: String,
      required: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
    quizResponses: [QuizResponseSchema],
    totalScore: {
      type: Number,
      required: true,
      min: 0,
    },
    maxScore: {
      type: Number,
      required: true,
      min: 0,
    },
    xpEarned: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
UserProgressSchema.index({ userId: 1 });
UserProgressSchema.index({ storyId: 1 });
UserProgressSchema.index({ completedAt: -1 });

// Compound index to prevent duplicate story completion
UserProgressSchema.index({ userId: 1, storyId: 1 }, { unique: true });

export default mongoose.model<IUserProgress>(
  "UserProgress",
  UserProgressSchema
);
