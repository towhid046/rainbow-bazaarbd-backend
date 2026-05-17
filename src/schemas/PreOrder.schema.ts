// src/schemas/preOrder.schema.ts
import { z } from "zod";

const baseSchema = z.object({
    studentName: z.string().optional(),
    studentId: z.string().optional(),
    studentNumber: z.string().optional(),
    bookName: z.string().optional(),
    copy: z.number().int().min(1, "Copy must be at least 1").optional(),
    totalAmount: z.number().min(0, "Total amount must be 0 or more").optional(),
    paidAmount: z.number().min(0, "Paid amount must be 0 or more").optional(),
    remainingDue: z.number().min(0, "Remaining due must be 0 or more").optional(),
    deliveryDate: z.coerce.date().optional(),
    status: z.enum(["Pending", "Success"]).optional(),
    createdAt: z.coerce.date().optional(),
});

export const preOrderCreateSchema = baseSchema;
export const preOrderUpdateSchema = baseSchema.partial();