import { Schema, model } from "mongoose";

const serviceSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
});

export const Service = model("Service", serviceSchema);
