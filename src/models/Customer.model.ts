import { Schema, model } from "mongoose";

// Schema for individual transactions
const transactionSchema = new Schema({ 
    type: { type: String, enum: ["credit", "debit"], required: true }, 
    amount: { type: Number, required: true }, 
    note: { type: String, default: "" }, 
    createdAt: { type: Date, default: Date.now } 
});

// Main customer schema
const customerSchema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  balance: { type: Number, required: true },
  transactions: [transactionSchema], 
  department: { type: String, required: true }, 
  year: { type: String, required: true }, 
  semester: { type: String, required: true }, 
  session: { type: String, required: true }, 
  createdAt: { type: Date, default: Date.now },
});

export const Customer = model("Customer", customerSchema);
