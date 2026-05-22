import { z } from "zod";

export const categoryZodSchema = z.object({
  name: z.string().min(1, "Name is required"),
  image: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional().default("active"),
});