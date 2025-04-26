import { Schema, model } from "mongoose";

const cartItemSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  product: { type: Schema.Types.ObjectId, ref: "Perfume" },
  size: { type: String },
  quantity: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now },
});

export const CartItem = model("CartItem", cartItemSchema);
