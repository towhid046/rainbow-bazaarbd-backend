import { Schema, model } from "mongoose";

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    oldPrice: {
      type: Number,
    },

    discount: {
      type: Number,
      default: 0,
    },

    images: {
      type: [String],
      required: true,
    },

    stock: {
      type: Number,
      required: true,
      default: 0,
    },

    soldCount: {
      type: Number,
      default: 0,
    },

    categoryId: {
      type: Schema.Types.ObjectId, 
      ref: "Category",             
      required: true,
    },

    rating: {
      type: Number,
      default: 0,
    },

    reviewCount: {
      type: Number,
      default: 0,
    },

    isFlash: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Product = model("Product", productSchema);