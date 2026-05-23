// src/models/Order.model.ts
// src/models/Order.model.ts
import { Schema, model, Types } from "mongoose";

const orderSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
    },

    name: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    zila: {
      type: String,
      required: true,
    },

    thana: {
      type: String,
      required: true,
    },

    fullAddress: {
      type: String,
      required: true,
    },

    note: {
      type: String,
    },

    items: [
      {
        productId: {
          type: Types.ObjectId,
          ref: "Product",
          required: true,
        },

        name: {
          type: String,
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],

    total: {
      type: Number,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["COD"],
      default: "COD",
    },

    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Canceled"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Order = model("Order", orderSchema);