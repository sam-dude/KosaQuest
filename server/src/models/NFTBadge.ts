import mongoose, { Document, Schema } from "mongoose";

export interface INFTBadge extends Document {
  userId: mongoose.Types.ObjectId;
  badgeName: string;
  badgeType:
    | "proverb_apprentice"
    | "story_master"
    | "quiz_champion"
    | "language_explorer";
  description: string;
  imageUrl: string;
  badgeLink: string;
  txHash?: string;
  xpRequired: number;
  issuedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NFTBadgeSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    badgeName: {
      type: String,
      required: true,
      trim: true,
    },
    badgeType: {
      type: String,
      enum: [
        "proverb_apprentice",
        "story_master",
        "quiz_champion",
        "language_explorer",
      ],
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    badgeLink: {
      type: String,
      required: true,
    },
    txHash: {
      type: String,
      sparse: true,
    },
    xpRequired: {
      type: Number,
      required: true,
      min: 0,
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
NFTBadgeSchema.index({ userId: 1 });
NFTBadgeSchema.index({ badgeType: 1 });
NFTBadgeSchema.index({ issuedAt: -1 });

// Compound index for user badges
NFTBadgeSchema.index({ userId: 1, badgeType: 1 }, { unique: true });

export default mongoose.model<INFTBadge>("NFTBadge", NFTBadgeSchema);
