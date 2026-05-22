// import { z } from "zod";

// export const productZodSchema = z.object({
//   name: z.string().min(1),
//   slug: z.string().min(1),
//   description: z.string().min(1),
//   price: z.number().positive(),
//   oldPrice: z.number().optional(),
//   discount: z.number().optional(),
//   images: z.array(z.string()).min(1),
//   stock: z.number().nonnegative(),
//   soldCount: z.number().optional(),
//   categoryId: z.string().min(1),
//   rating: z.number().optional(),
//   reviewCount: z.number().optional(),
//   isFlash: z.boolean().optional(),
//   isActive: z.boolean().optional(),
// });

import { z } from "zod";

export const productZodSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  oldPrice: z.number().optional(),
  discount: z.number().optional(),
  images: z.array(z.string()).min(1),
  stock: z.number().nonnegative(),
  soldCount: z.number().optional(),
  category: z.string().min(1), // Changed from categoryId to category
  rating: z.number().optional(),
  reviewCount: z.number().optional(),
  isFlash: z.boolean().optional(),
  isActive: z.boolean().optional(),
});