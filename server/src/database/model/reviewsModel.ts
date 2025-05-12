import { Schema, model } from "mongoose";

const testimonialSchema = new Schema({
  imageUrl: { type: String, required: true }, // screenshot image
  featured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const Testimonial = model("Testimonial", testimonialSchema);
