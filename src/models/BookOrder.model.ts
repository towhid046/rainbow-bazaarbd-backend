import { Schema, model } from "mongoose";

const bookOrderSchema = new Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    area: { type: String, required: true, trim: true },
    streetAddress: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true, match: /^\d{11}$/ },
    orderNotes: { type: String, trim: true },
    status: { type: String, enum: ["Pending", "Processing", "Delivered", "Canceled"], default: "Pending" },
    deliveryOption: { type: String, enum: ["COD", "At Shop"], required: true },
    bookIds: [
        {
            id: { type: Schema.Types.ObjectId, ref: "Book", required: true },
            count: { type: Number, required: true, min: 1 },
            condition: { type: String, enum: ['New', 'Used'], required: true }
        },
    ],
    totalPrice: {type: Number, require: true},
    createdAt: { type: Date, default: Date.now },
});

export const BookOrder = model("BookOrder", bookOrderSchema);