// models/notification.model.ts
import { Schema, model } from "mongoose";

const notificationSchema = new Schema({
  message: { type: String, required: true },
  title: { type: String, required: true },
  read: { type: Boolean, default: false },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Notification = model("Notification", notificationSchema);
