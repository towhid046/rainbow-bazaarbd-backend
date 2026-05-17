import { Schema, model } from "mongoose";

const editionSchema = new Schema({
    condition: { type: String, enum: ['New', 'Used'], required: true },
    price: { type: Number, required: true },
    stockCount: { type: Number, required: true }
});

export const bookSchema = new Schema({
    image: { type: String, required: true },
    title: { type: String, required: true, unique: true },
    author: { type: String, required: true },
    location: { type: String, required: true },
    editions: [editionSchema],
    createdAt: { type: Date, default: Date.now() }
});

export const Book = model("Book", bookSchema);
