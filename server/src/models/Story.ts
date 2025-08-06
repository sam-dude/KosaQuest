import mongoose, { Document, Schema } from "mongoose";

export interface IQuiz {
  questionId: string;
  question: string;
  options: string[];
  answer: string;
  points: number;
}

export interface IPage {
  pageNo: number;
  english: string;
  native: string;
}

export interface IStory extends Document {
  storyId: string;
  title: string;
  description: string;
  language: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  pages: IPage[];
  quizzes: IQuiz[];
  totalXP: number;
  isActive: boolean;
  metadata?: {
    source?: string;
    region?: string;
    culture?: string;
    audience?: string;
    collection?: string;
    themes?: string[];
    author?: string;
    createdAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const QuizSchema: Schema = new Schema({
  questionId: {
    type: String,
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  options: [
    {
      type: String,
      required: true,
    },
  ],
  answer: {
    type: String,
    required: true,
  },
  points: {
    type: Number,
    required: true,
    min: 1,
  },
});

const PageSchema: Schema = new Schema({
  pageNo: {
    type: Number,
    required: true,
    min: 1,
  },
  english: {
    type: String,
    required: true,
  },
  native: {
    type: String,
    required: true,
  },
});

const StorySchema: Schema = new Schema(
  {
    storyId: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    language: {
      type: String,
      required: true,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    pages: [PageSchema],
    quizzes: [QuizSchema],
    totalXP: {
      type: Number,
      required: true,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    metadata: {
      source: { type: String },
      region: { type: String },
      culture: { type: String },
      audience: { type: String },
      collection: { type: String },
      themes: [{ type: String }],
      author: { type: String },
      createdAt: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
StorySchema.index({ storyId: 1 });
StorySchema.index({ isActive: 1 });
StorySchema.index({ difficulty: 1 });

export default mongoose.model<IStory>("Story", StorySchema);
