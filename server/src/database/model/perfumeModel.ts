import { Schema, model } from "mongoose";

const perfumeSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["perfume", "sample"], default: "perfume" },
  sizes: [
    {
      label: { type: String }, // example: "50ml", "100ml"
      price: { type: Number }, // price for this size
    },
  ],
  description: { type: String },
  price: { type: Number }, // price
  imageUrl: { type: String }, // main image
  category: { type: String, enum: ["men", "women", "un"] },
  brand: { type: String }, // brand name
  notes: {
    top: [String],
    middle: [String],
    base: [String],
  }, // scent notes like "Citrus", "Vanilla"
  rating: { type: Number, default: 0 }, // 0-5 stars
  reviewsCount: { type: Number, default: 0 }, // number of reviews
  stock: { type: Number, default: 0 }, // number of items in stock
  featured: { type: Boolean, default: false }, // for homepage "Featured" section
  limitedEdition: { type: Boolean, default: false }, // if limited edition
  comingSoon: { type: Boolean, default: false }, // if coming soon
  discount: { type: Number, default: 0 }, // discount percentage
  createdBy: { type: Schema.Types.ObjectId, ref: "User" }, // admin who created the perfume
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Perfume = model("Perfume", perfumeSchema);
