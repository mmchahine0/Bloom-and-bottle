import { Schema, model } from "mongoose";

const passwordResetSchema = new Schema({
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  createdAt: { type: Date, default: Date.now },
});

export const PasswordReset = model("PasswordReset", passwordResetSchema);
