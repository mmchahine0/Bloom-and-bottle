import { Schema, model } from "mongoose";

const userSchema = new Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // only needed if login
  suspended: { type: Boolean, default: false }, // if the user is suspended
  role: { type: String, enum: ["user", "admin"], default: "user" },
  surveyAnswers: { type: Map, of: String }, // store small survey answers
  orders: [{ type: Schema.Types.ObjectId, ref: "Order" }],
  createdAt: { type: Date, default: Date.now },
});

export const User = model("User", userSchema);
