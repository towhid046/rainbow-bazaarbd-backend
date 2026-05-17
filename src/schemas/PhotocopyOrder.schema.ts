import { z } from "zod";

export const photocopyOrderZodSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z
    .string()
    .length(11, "Phone number must be 11 digits")
    .regex(/^\d{11}$/, "Phone number must contain only 11 digits"),
  address: z.string().min(5, "Address must be at least 5 characters long"),
  department: z.string().optional(),
  year: z.string().optional(),
  semester: z.string().optional(),
  lectureSheets: z
    .array(
      z.object({
        id: z.number().int().positive("ID must be a positive integer"),
        name: z.string().min(1, "Lecture sheet name is required"),
      })
    )
    .optional(),
    pdfMeta: z
    .array(
      z.object({
        printType: z.string(),
        copies:    z.number().int().min(1),
      })
    )
    .optional(),
});
