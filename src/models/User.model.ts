import { Schema, model, Types } from "mongoose";

const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ["member", "admin"] },
    orderIds: [{ type: Types.ObjectId, ref: "BookOrder" }],
});

export const User = model("User", userSchema);
