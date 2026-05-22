import { Schema, model } from "mongoose";

const categorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true, trim: true },

    // NEW
    image: { type: String, default: null },

    items: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Category = model("Category", categorySchema);