import { Schema, model } from "mongoose";

const cartItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: "Perfume", required: true },
  size: { type: String, required: true },
  quantity: { type: Number, default: 1, min: 1, max: 10 },
  price: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const collectionCartItemSchema = new Schema({
  collectionId: { type: Schema.Types.ObjectId, ref: "Collection", required: true },
  products: [{
    productId: { type: Schema.Types.ObjectId, ref: "Perfume", required: true },
    size: { type: String, required: true },
    quantity: { type: Number, default: 1, min: 1, max: 10 }
  }],
  price: { type: Number, required: true, default: 0 },
  quantity: { type: Number, default: 1, min: 1, max: 10 }, 
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const cartSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  items: [cartItemSchema], 
  collectionItems: [collectionCartItemSchema], 
  totalItems: { type: Number, default: 0 },
  totalPrice: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
});

// Update timestamps on save
cartSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

export const Cart = model("Cart", cartSchema);
export const CartItem = model("CartItem", cartItemSchema);
export const CollectionCartItem = model("CollectionCartItem", collectionCartItemSchema);