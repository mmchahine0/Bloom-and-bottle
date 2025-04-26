import { Schema, model } from "mongoose";

const verificationCodeSchema = new Schema({
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  }, // one code per user
  createdAt: { type: Date, default: Date.now },
});

export const VerificationCode = model(
  "VerificationCode",
  verificationCodeSchema
);
