import { Schema, model } from "mongoose";

const categorySchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
  imageUrl: { type: String },
});

export const Category = model("Category", categorySchema);
