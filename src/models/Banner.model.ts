import { Schema, model } from "mongoose";

export interface IBanner {
  imageUrl: string;
  isActive: boolean;
  order: number;
}

const bannerSchema = new Schema<IBanner>(
  {
    imageUrl: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Banner = model<IBanner>("Banner", bannerSchema);
