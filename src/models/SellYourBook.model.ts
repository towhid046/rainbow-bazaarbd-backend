import { Schema, model, Document } from "mongoose";

interface IBook {
  bookName: string;
  authorName: string;
  images: string[];
}

export interface ISellYourBook extends Document {
  studentName: string;
  mobile: string;
  address: string;
  books: IBook[];
  createdAt: Date;
}

const BookSchema = new Schema<IBook>({
  bookName: { type: String, required: true },
  authorName: { type: String, required: true },
  images: [{ type: String, required: true }],
});

const SellYourBookSchema = new Schema<ISellYourBook>({
  studentName: { type: String, required: true },
  mobile: { type: String, required: true },
  address: { type: String, required: true },
  books: { type: [BookSchema], required: true },
  createdAt: { type: Date, default: () => new Date() },
});

export const SellYourBook = model<ISellYourBook>(
  "SellYourBook",
  SellYourBookSchema
);