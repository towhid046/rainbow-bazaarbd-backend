import { z } from "zod";

// Schema for a single transaction
const transactionSchema = z.object({
  type: z.enum(["credit", "debit"]),
  amount: z.number().positive("Amount must be positive"),
  note: z.string().optional(),
  createdAt: z.date().optional().default(new Date()),
});

// Main customer schema
export const customerZodSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  phone: z
    .string()
    .trim()
    .length(11, "Phone number must be exactly 11 digits"),
  balance: z.number().nonnegative("Balance must be 0 or more"),
  transactions: z.array(transactionSchema).optional(),
  department: z.string().trim().min(1, "Department is required"),
  year: z.string().trim().min(1, "Year is required"),
  semester: z.string().trim().min(1, "Semester is required"),
  session: z.string().trim().min(1, "Session is required"),
  createdAt: z.date().optional().default(new Date()),
});

export type Customer = z.infer<typeof customerZodSchema>;
export type Transaction = z.infer<typeof transactionSchema>;
