import { Schema, model } from "mongoose";

const contactMessageSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, enum: ["Pending", "Answered"], default: "Pending" },
});

export const ContactMessage = model("ContactMessage", contactMessageSchema);
