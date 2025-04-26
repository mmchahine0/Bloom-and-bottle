import { Schema, model } from "mongoose";

const collectionSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  perfumes: [{ type: Schema.Types.ObjectId, ref: "Perfume" }], // multiple perfumes
  image: { type: String }, // banner image
  featured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const Collection = model("Collection", collectionSchema);
