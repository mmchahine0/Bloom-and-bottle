import { Schema, model } from "mongoose";

const testimonialSchema = new Schema({
  imageUrl: { type: String, required: true }, // screenshot image
  name: { type: String }, // optional, the person name if you want
  featured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const Testimonial = model("Testimonial", testimonialSchema);
