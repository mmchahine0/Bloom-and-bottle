import { Schema, model } from "mongoose";

const orderItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: "Perfume" },
  size: { type: String }, // example: "50ml", "100ml"
  quantity: { type: Number, default: 1 },
});

const orderSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  items: [orderItemSchema], // Embed the snapshot directly
  totalPrice: { type: Number },
  status: {
    type: String,
    enum: ["pending", "completed", "canceled"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

export const Order = model("Order", orderSchema);
