import { Schema, model } from "mongoose";
const userSchema = new Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    suspended: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    role: { type: String, enum: ["USER", "ADMIN"], default: "USER" },
    surveyAnswers: { type: Map, of: String },
    orders: [{ type: Schema.Types.ObjectId, ref: "Order" }],
    notifications: [{ type: Schema.Types.ObjectId, ref: "Notification" }],
    verificationCode: { type: Schema.Types.ObjectId, ref: "VerificationCode" },
    passwordReset: { type: Schema.Types.ObjectId, ref: "PasswordReset" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true, // This will automatically handle createdAt and updatedAt
  }
);

export const User = model("User", userSchema);
