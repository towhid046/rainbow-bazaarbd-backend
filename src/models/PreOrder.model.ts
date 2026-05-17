// src/models/PreOrder.model.ts
import { Schema, model } from "mongoose";

export const preOrderSchema = new Schema({
studentName: { type: String, default: "" },
studentId: { type: String, default: "" },
studentNumber: { type: String, default: "" },
bookName: { type: String, default: "" },
copy: { type: Number, default: 1 },
totalAmount: { type: Number, default: 0 },
paidAmount: { type: Number, default: 0 },
remainingDue: { type: Number, default: 0 },
deliveryDate: { type: Date, default: Date.now },
status: { type: String, enum: ["Pending", "Success"], default: "Pending" },
createdAt: { type: Date, default: Date.now },
});

export const PreOrder = model("PreOrder", preOrderSchema);