// src/schemas/Order.schema.ts
import { z } from "zod";

export const orderStatusEnum = z.enum([
  "Pending",
  "Processing",
  "Canceled",
  "Shipped",
  "Delivered",
]);

export const orderZodSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone number is required"),
  zila: z.string().min(1, "Zila is required"),
  thana: z.string().min(1, "Thana is required"),
  fullAddress: z.string().min(1, "Full address is required"),
  note: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, "Product ID is required"),

        quantity: z
          .number()
          .int()
          .positive("Quantity must be greater than 0"),
      })
    )
    .min(1, "Order must contain at least one item"),
  paymentMethod: z
    .enum(["COD"])
    .default("COD"),
  status: orderStatusEnum.default("Pending"),
});