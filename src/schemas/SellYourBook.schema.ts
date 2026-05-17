import { z } from "zod";

const BookZod = z.object({
  bookName: z.string().min(1, "Book name is required"),
  authorName: z.string().min(1, "Author name is required"),
  images: z.array(z.string().url("Invalid image URL")).nonempty("At least one image URL is required"),
});

export const sellYourBookZodSchema = z.object({
  studentName: z.string().min(1, "Student name is required"),
  mobile: z
  .string()
  .length(11, "Mobile number must be exactly 11 digits")
  .regex(/^\d+$/, "Mobile number must contain only digits"),
  address: z.string().min(1, "Address is required"),
  books: z.array(BookZod).min(1, "At least one book is required"),
});

export type SellYourBookInput = z.infer<typeof sellYourBookZodSchema>;