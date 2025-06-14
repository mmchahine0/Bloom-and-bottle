import { Schema, model } from "mongoose";

const orderItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: "Perfume" },
  size: { type: String },
  quantity: { type: Number, default: 1 },
  price: { type: Number, required: true },
  originalPrice: { type: Number, required: true }, 
  discount: { type: Number, default: 0 },
  type: { type: String, enum: ["perfume", "sample"], default: "perfume" }
});

// NEW: Collection order item schema
const orderCollectionItemSchema = new Schema({
  collectionId: { type: Schema.Types.ObjectId, ref: "Collection", required: true },
  collectionName: { type: String, required: true },
  products: [{
    productId: { type: Schema.Types.ObjectId, ref: "Perfume", required: true },
    name: { type: String, required: true },
    size: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    discount: { type: Number, default: 0 }
  }],
  quantity: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  originalTotalPrice: { type: Number, required: true },
  discount: { type: Number, default: 0 }
});

const orderSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  items: [orderItemSchema],
  collectionItems: [orderCollectionItemSchema], 
  totalItems: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  originalTotalPrice: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["pending", "completed", "canceled"],
    default: "pending",
  },
  shippingAddress: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update timestamps on save
orderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Order = model("Order", orderSchema);
